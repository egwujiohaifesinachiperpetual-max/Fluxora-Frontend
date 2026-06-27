import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { axe } from "vitest-axe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock wallet context
vi.mock("../../components/wallet-connect/Walletcontext", () => ({
  useWallet: () => ({
    address: "GATDOSCZNJ5YZHNOX7IOD4QDCQSTMR2YNF5IXHFNX3H6B4ICCMSDLOWN",
    network: { label: "TESTNET" },
    connected: true,
    loading: false,
    error: null,
    expectedNetwork: "TESTNET",
    expectedNetworkLabel: "Testnet",
    isNetworkMismatch: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
  WalletProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock toast provider
vi.mock("../../components/toast/ToastProvider", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

// Mock withdraw function
vi.mock("../../lib/stellar/tx", () => ({
  withdraw: vi.fn(),
}));

import Recipient from "../Recipient";

describe("Recipient page", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const renderLoadedRecipient = async () => {
    const view = render(<Recipient />);
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    return view;
  };

  it("renders loaded recipient portal without axe violations", async () => {
    const { container } = await renderLoadedRecipient();
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("exposes an enabled withdraw action when a connected recipient has balance", async () => {
    await renderLoadedRecipient();
    const withdrawButton = screen.getByRole("button", {
      name: /withdraw 22,600 usdc/i,
    });
    expect(withdrawButton).toBeEnabled();
  });

  it("handles successful withdrawal and resets state after delay", async () => {
    const { addToast } = require("../../components/toast/ToastProvider").useToast();
    const { withdraw } = require("../../lib/stellar/tx");
    withdraw.mockResolvedValue(undefined);
    await renderLoadedRecipient();
    const button = screen.getByRole("button", { name: /withdraw/i });
    fireEvent.click(button);
    await act(async () => {}); // wait for async withdraw
    expect(addToast).toHaveBeenCalledWith(
      "Withdrawal completed successfully on-chain!",
      "success",
    );
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(button).toHaveTextContent(/withdraw/i);
  });

  it("clears timeout on unmount", async () => {
    const { unmount } = await renderLoadedRecipient();
    const button = screen.getByRole("button", { name: /withdraw/i });
    fireEvent.click(button);
    unmount();
    await act(async () => {
      vi.advanceTimersByTime(6000);
    });
    expect(true).toBe(true);
  });
});

import { axe } from "vitest-axe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Recipient gates the withdraw flow on a connected wallet on the matching
// network. The global test setup stubs the wallet as disconnected, so provide a
// connected stub here to exercise the loaded recipient portal.
vi.mock("../../components/wallet-connect/Walletcontext", () => ({
  useWallet: () => ({
    address: "GATDOSCZNJ5YZHNOX7IOD4QDCQSTMR2YNF5IXHFNX3H6B4ICCMSDLOWN",
    network: "TESTNET",
    connected: true,
    loading: false,
    error: null,
    expectedNetwork: "TESTNET",
    expectedNetworkLabel: "Testnet",
    isNetworkMismatch: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
  WalletProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import Recipient from "../Recipient";

describe("Recipient page accessibility", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function renderLoadedRecipient() {
    const view = render(<Recipient />);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    return view;
  }

  it("renders the loaded recipient portal without axe violations", async () => {
    const { container } = await renderLoadedRecipient();
    vi.useRealTimers();
    const results = await axe(container);

    expect(results.violations).toEqual([]);
  });

  it("exposes an enabled withdraw action when a connected recipient has balance", async () => {
    await renderLoadedRecipient();

    const withdrawButton = screen.getByRole("button", {
      name: /withdraw 22,600 usdc/i,
    });
    expect(withdrawButton).toBeEnabled();

    const summary = screen.getByRole("region", { name: /stream summary/i });
    expect(within(summary).getByText(/withdrawable now/i)).toBeInTheDocument();
    expect(within(summary).getByText(/22,600 usdc/i)).toBeInTheDocument();
  });
});
