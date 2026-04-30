import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface TruncatedAddressProps {
  address: string;
  label?: string;
  className?: string;
  onCopy?: (address: string) => void;
}

/**
 * TruncatedAddress component provides a consistent way to display Stellar addresses
 * with truncation (ABCD...WXYZ), optional labeling, and copy-to-clipboard functionality.
 * It uses standard design tokens for typography and colors.
 */
export default function TruncatedAddress({
  address,
  label,
  className = "",
  onCopy,
}: TruncatedAddressProps) {
  const [copied, setCopied] = useState(false);

  // Stellar address truncation: first 6 characters + "..." + last 4 characters
  const truncated =
    address.length > 12
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;

  const handleCopy = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      onCopy?.(address);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 max-w-full ${className}`}
      title={address}
    >
      {label && (
        <span 
          className="text-label-sm whitespace-nowrap"
          style={{ color: "var(--color-text-muted)" }}
        >
          {label}:
        </span>
      )}
      <div
        className="flex items-center gap-1.5 group cursor-pointer"
        onClick={handleCopy}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            void handleCopy(e);
          }
        }}
        aria-label={`${copied ? "Copied" : "Copy"} ${label || "address"}: ${address}`}
      >
        <code 
          className="text-mono-sm truncate"
          style={{ 
            background: "var(--surface-raised)",
            padding: "2px 8px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border-default)",
            color: "var(--color-text-primary)",
            transition: "border-color var(--transition-fast)"
          }}
        >
          {truncated}
        </code>
        <div
          className="flex items-center justify-center transition-colors"
          style={{ color: copied ? "var(--color-success)" : "var(--color-text-muted)" }}
        >
          {copied ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <Copy
              size={14}
              aria-hidden="true"
              className="group-hover:text-primary transition-colors opacity-70"
            />
          )}
        </div>
      </div>
    </div>
  );
}
