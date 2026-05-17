import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Button, Form, Modal, Badge, Alert } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { useWeb3 } from "../context/Web3Context";
import { ConnectGate } from "../components/shared/ConnectGate";
import { ContractGuard } from "../components/shared/ContractGuard";
import { PageLayout, LoadingSpinner, EmptyState } from "../components/shared/PageLayout";
import { useOwnedTokenIds } from "../hooks/useOwnedTokenIds";
import { useTransaction } from "../hooks/useTransaction";
import { getProperties } from "../api/realfraction";
import {
  LISTING_TYPES,
  DEFAULT_LIST_FORM,
  CONTRACT_NAMES,
  SECONDS_PER_DAY,
} from "../config/constants";
import { ethers } from "ethers";

// ─── helpers ────────────────────────────────────────────────────────────────

const STATUS_VARIANT = { listed: "success", verified: "primary", draft: "secondary" };

function truncateAddr(addr) {
  if (!addr || addr.length < 10) return addr || "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

// ─── data hook ──────────────────────────────────────────────────────────────

function usePropertiesData() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    let cancelled = false;
    getProperties()
      .then((data) => {
        if (!cancelled) {
          setProperties(data.properties || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to load properties");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const cancel = load();
    return cancel;
  }, [load]);

  return { properties, loading, error, retry: load };
}

// ─── skeleton ───────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="table-responsive" aria-busy="true" aria-label="Loading properties">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-dark">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Title</th>
            <th scope="col">Type</th>
            <th scope="col">Status</th>
            <th scope="col">Owner Address</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} aria-hidden="true">
              {[1, 4, 3, 2, 5].map((col, j) => (
                <td key={j}>
                  <span
                    className={`placeholder col-${col} rounded`}
                    style={{ opacity: 1 - i * 0.15 }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── properties table ────────────────────────────────────────────────────────

function PropertiesTable() {
  const { properties, loading, error, retry } = usePropertiesData();

  return (
    <section className="mb-5" aria-label="All properties">
      <h5 className="fw-semibold mb-3 text-white">All Properties</h5>

      {error && (
        <Alert variant="danger" className="d-flex align-items-center gap-3">
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
          <span className="flex-grow-1">{error}</span>
          <Button variant="outline-danger" size="sm" onClick={retry}>
            Retry
          </Button>
        </Alert>
      )}

      {loading && <TableSkeleton />}

      <AnimatePresence>
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="table-responsive rounded-3 overflow-hidden shadow-sm"
          >
            <table className="table table-hover align-middle mb-0" aria-label="Properties table">
              <thead className="table-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Title</th>
                  <th scope="col">Type</th>
                  <th scope="col">Status</th>
                  <th scope="col">Owner Address</th>
                </tr>
              </thead>
              <tbody>
                {properties.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">
                      No properties found.
                    </td>
                  </tr>
                ) : (
                  properties.map((p) => (
                    <tr key={p.tokenId}>
                      <td className="fw-semibold">#{p.tokenId}</td>
                      <td>{p.title || "—"}</td>
                      <td>{p.propertyType || "—"}</td>
                      <td>
                        <Badge
                          bg={STATUS_VARIANT[p.status] || "secondary"}
                          className="text-capitalize"
                        >
                          {p.status || "unknown"}
                        </Badge>
                      </td>
                      <td>
                        <code className="small user-select-all" title={p.ownerAddress}>
                          {truncateAddr(p.ownerAddress)}
                        </code>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── NFT management (wallet + contract required) ─────────────────────────────

const initialListForm = () => ({
  type: String(LISTING_TYPES.SALE),
  price: DEFAULT_LIST_FORM.price,
  rentDays: DEFAULT_LIST_FORM.rentDays,
  auctionEndHours: DEFAULT_LIST_FORM.auctionEndHours,
});

function NFTContent() {
  const { address, contracts, config } = useWeb3();
  const { tokenIds, loading } = useOwnedTokenIds(contracts, address);
  const { execute, isPending } = useTransaction();
  const [listModal, setListModal] = useState(null);
  const [listForm, setListForm] = useState(initialListForm());

  const resetListModal = useCallback(() => {
    setListModal(null);
    setListForm(initialListForm());
  }, []);

  const handleList = useCallback(
    async () => {
      if (listModal == null || !contracts?.Marketplace || !contracts?.PropertyNft) return;
      const tokenId = listModal;
      const { type, price, rentDays, auctionEndHours } = listForm;
      const priceWei = ethers.parseEther(price?.trim() || "0");
      if (priceWei === 0n) return;
      const rentDurationSeconds = type === String(LISTING_TYPES.RENT) ? Number(rentDays) * SECONDS_PER_DAY : 0;
      const auctionEndTime =
        type === String(LISTING_TYPES.AUCTION)
          ? Math.floor(Date.now() / 1000) + Number(auctionEndHours || 24) * 3600
          : 0;

      try {
        const marketplaceAddress = config?.Marketplace;
        if (marketplaceAddress) {
          const approved = await contracts.PropertyNft.getApproved(tokenId);
          if (approved !== marketplaceAddress) {
            await execute(
              `approve-${tokenId}`,
              () =>
                contracts.PropertyNft.approve(marketplaceAddress, tokenId).then((tx) => tx.wait()),
              { successMessage: "Approval set.", errorMessage: "Approval failed." }
            );
          }
        }
        await execute(
          `list-${tokenId}`,
          () =>
            contracts.Marketplace.list(
              tokenId,
              type,
              priceWei,
              rentDurationSeconds,
              auctionEndTime
            ).then((tx) => tx.wait()),
          { successMessage: "Listed.", errorMessage: "List failed." }
        );
        resetListModal();
      } catch (_) {}
    },
    [listModal, listForm, contracts, config, execute, resetListModal]
  );

  return (
    <>
      <h5 className="fw-semibold mb-3 text-white">My NFT Properties</h5>
      {loading && <LoadingSpinner />}
      {!loading && tokenIds.length === 0 && (
        <EmptyState message="You don't own any property NFTs yet. Mint one from Admin if you have minter role." />
      )}
      {!loading && tokenIds.length > 0 && (
        <Row xs={1} md={2} lg={3} className="g-4">
          {tokenIds.map((id) => (
            <Col key={id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>Token #{id}</Card.Title>
                  <Button variant="primary" size="sm" onClick={() => setListModal(id)}>
                    List on Marketplace
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      <Modal show={listModal != null} onHide={resetListModal} centered aria-labelledby="list-modal-title">
        <Modal.Header closeButton>
          <Modal.Title id="list-modal-title">List Token #{listModal}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Type</Form.Label>
            <Form.Select
              value={listForm.type}
              onChange={(e) => setListForm((f) => ({ ...f, type: e.target.value }))}
            >
              <option value={String(LISTING_TYPES.SALE)}>Sale</option>
              <option value={String(LISTING_TYPES.RENT)}>Rent</option>
              <option value={String(LISTING_TYPES.AUCTION)}>Auction</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Price (ETH)</Form.Label>
            <Form.Control
              type="text"
              placeholder="0.1"
              value={listForm.price}
              onChange={(e) => setListForm((f) => ({ ...f, price: e.target.value }))}
            />
          </Form.Group>
          {listForm.type === String(LISTING_TYPES.RENT) && (
            <Form.Group className="mb-2">
              <Form.Label>Rent duration (days)</Form.Label>
              <Form.Control
                type="number"
                value={listForm.rentDays}
                onChange={(e) => setListForm((f) => ({ ...f, rentDays: e.target.value }))}
              />
            </Form.Group>
          )}
          {listForm.type === String(LISTING_TYPES.AUCTION) && (
            <Form.Group className="mb-2">
              <Form.Label>Auction end (hours from now)</Form.Label>
              <Form.Control
                type="number"
                value={listForm.auctionEndHours}
                onChange={(e) => setListForm((f) => ({ ...f, auctionEndHours: e.target.value }))}
              />
            </Form.Group>
          )}
          <Button
            variant="primary"
            className="w-100"
            disabled={isPending(`list-${listModal}`) || !listForm.price?.trim()}
            onClick={handleList}
          >
            {isPending(`list-${listModal}`) ? "Confirming…" : "List"}
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function MyPropertiesPage() {
  return (
    <PageLayout title="My Properties">
      <PropertiesTable />
      <ConnectGate message="Connect your wallet to manage your NFT properties.">
        <ContractGuard contractNames={CONTRACT_NAMES.PROPERTY_NFT}>
          <NFTContent />
        </ContractGuard>
      </ConnectGate>
    </PageLayout>
  );
}
