"use client";

import { useState } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import {
  Loader2,
  Wallet,
  Image,
  Grid3X3,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Copy,
  Users,
  Coins,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type WalletResult = {
  address: string;
  ethBalance: string;
  riskLevel: string;
  riskScore: number;
  tokens: {
    symbol: string;
    balance: string;
    price?: number;
    riskLevel: string;
    riskFactors: string[];
  }[];
  nfts: {
    name: string;
    riskLevel: string;
    riskFactors: string[];
  }[];
  summary: string;
};

type CollectionResult = {
  contractAddress: string;
  name: string;
  totalSupply: number;
  floorPrice?: number;
  holderCount: number;
  topHolders: {
    address: string;
    count: number;
    percentage: number;
  }[];
  riskLevel: string;
  riskFactors: string[];
  auditStatus: string;
};

type NFTResult = {
  contractAddress: string;
  tokenId: string;
  name: string;
  description: string;
  riskLevel: string;
  riskFactors: string[];
  metadata?: {
    collection?: string;
    owner?: string;
    verified: boolean;
    attributes?: { trait_type?: string; type?: string; value: string }[];
  };
};

type AnalysisResult = WalletResult | CollectionResult | NFTResult;
type AnalysisType = "wallet" | "collection" | "nft";

export default function Web3AnalyzerPage() {
  const [analysisType, setAnalysisType] = useState<AnalysisType>("wallet");
  const [address, setAddress] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const placeholders = {
    wallet: [
      "0x742d35Cc6634C0532925a3b8D4C0C3c6c8C8C6C6",
      "Enter Ethereum wallet address...",
      "Analyze wallet for risks...",
    ],
    collection: [
      "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      "Enter NFT collection contract address...",
      "Analyze collection risks...",
    ],
    nft: [
      "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      "Enter NFT contract address...",
      "Analyze specific NFT...",
    ],
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleTokenIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenId(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    runAnalysis(address, tokenId);
  };

  const runAnalysis = async (inputAddress: string, inputTokenId?: string) => {
    setLoading(true);
    setResult(null);

    try {
      let endpoint = "";
      let body: Record<string, unknown> = {};

      switch (analysisType) {
        case "wallet":
          endpoint = "/api/wallet-scan";
          body = { address: inputAddress };
          break;
        case "collection":
          endpoint = "/api/collection-check";
          body = { contractAddress: inputAddress };
          break;
        case "nft":
          endpoint = "/api/nft-analyzer";
          body = { contractAddress: inputAddress, tokenId: inputTokenId };
          break;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to analyze");
        setResult(null);
        return;
      }

      setResult(data);
    } catch (error) {
      console.error("Error during analysis:", error);
      alert("Failed to analyze. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeClick = () => {
    runAnalysis(address, tokenId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getRiskBadge = (riskLevel: string) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (riskLevel.toLowerCase()) {
      case "low":
        return (
          <span
            className={cn(
              baseClasses,
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            )}
          >
            <ShieldCheck className="w-3 h-3 mr-1" />
            Low Risk
          </span>
        );
      case "medium":
        return (
          <span
            className={cn(
              baseClasses,
              "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            )}
          >
            <Shield className="w-3 h-3 mr-1" />
            Medium Risk
          </span>
        );
      case "high":
        return (
          <span
            className={cn(
              baseClasses,
              "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            )}
          >
            <ShieldAlert className="w-3 h-3 mr-1" />
            High Risk
          </span>
        );
      default:
        return (
          <span
            className={cn(
              baseClasses,
              "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            )}
          >
            <Shield className="w-3 h-3 mr-1" />
            {riskLevel}
          </span>
        );
    }
  };

  const getAuditBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status.toLowerCase()) {
      case "verified":
      case "audited":
        return (
          <span
            className={cn(
              baseClasses,
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            )}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </span>
        );
      case "unverified":
      case "not audited":
        return (
          <span
            className={cn(
              baseClasses,
              "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            )}
          >
            <XCircle className="w-3 h-3 mr-1" />
            Unverified
          </span>
        );
      default:
        return (
          <span
            className={cn(
              baseClasses,
              "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            )}
          >
            {status}
          </span>
        );
    }
  };

  const renderWalletResult = (data: WalletResult) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Wallet Analysis
            </h3>
          </div>
          {getRiskBadge(data.riskLevel)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Address
              </p>
              <button
                onClick={() => copyToClipboard(data.address)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="font-mono text-sm mt-1 break-all">{data.address}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ETH Balance
            </p>
            <p className="text-lg font-semibold mt-1">
              {parseFloat(data.ethBalance).toFixed(4)} ETH
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Risk Score
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all",
                    data.riskScore < 30
                      ? "bg-green-500"
                      : data.riskScore < 70
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  )}
                  style={{ width: `${data.riskScore}%` }}
                />
              </div>
              <span className="text-lg font-semibold">
                {data.riskScore}/100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tokens */}
      {data.tokens.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Coins className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            <h4 className="text-lg font-semibold">
              Tokens ({data.tokens.length})
            </h4>
          </div>

          <div className="space-y-3">
            {data.tokens.map((token, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{token.symbol}</span>
                    {getRiskBadge(token.riskLevel)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {parseFloat(token.balance).toFixed(2)}
                    {token.price && (
                      <span className="ml-2 text-green-600 dark:text-green-400">
                        (${(parseFloat(token.balance) * token.price).toFixed(2)}
                        )
                      </span>
                    )}
                  </div>
                  {token.riskFactors.length > 0 && (
                    <div className="flex items-start space-x-1 mt-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-orange-600 dark:text-orange-400">
                        {token.riskFactors.join(", ")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NFTs */}
      {data.nfts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Image className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h4 className="text-lg font-semibold">NFTs ({data.nfts.length})</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.nfts.map((nft, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium truncate">{nft.name}</h5>
                  {getRiskBadge(nft.riskLevel)}
                </div>
                {nft.riskFactors.length > 0 && (
                  <div className="flex items-start space-x-1">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-orange-600 dark:text-orange-400">
                      {nft.riskFactors.join(", ")}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold mb-3">Analysis Summary</h4>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {data.summary}
        </p>
      </div>
    </div>
  );

  const renderCollectionResult = (data: CollectionResult) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Grid3X3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Collection Analysis
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {getRiskBadge(data.riskLevel)}
            {getAuditBadge(data.auditStatus)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Contract
              </p>
              <button
                onClick={() => copyToClipboard(data.contractAddress)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="font-mono text-sm mt-1 break-all">
              {data.contractAddress}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Collection Name
            </p>
            <p className="text-lg font-semibold mt-1 truncate">{data.name}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Supply
            </p>
            <p className="text-lg font-semibold mt-1">
              {data.totalSupply.toLocaleString()}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Unique Holders
            </p>
            <p className="text-lg font-semibold mt-1">
              {data.holderCount.toLocaleString()}
            </p>
          </div>
        </div>

        {data.floorPrice && (
          <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg inline-block">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Floor Price
            </p>
            <p className="text-lg font-semibold mt-1 text-green-600 dark:text-green-400">
              {data.floorPrice.toFixed(4)} ETH
            </p>
          </div>
        )}
      </div>

      {/* Top Holders */}
      {data.topHolders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h4 className="text-lg font-semibold">Top Holders</h4>
          </div>

          <div className="space-y-3">
            {data.topHolders.slice(0, 5).map((holder, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-mono text-sm">
                      {holder.address.slice(0, 6)}...{holder.address.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {holder.percentage.toFixed(1)}% of supply
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{holder.count}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    NFTs
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Factors */}
      {data.riskFactors.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-950 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
              Risk Factors
            </h4>
          </div>

          <div className="space-y-2">
            {data.riskFactors.map((factor, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-orange-700 dark:text-orange-300">{factor}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderNFTResult = (data: NFTResult) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-6 rounded-xl border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Image className="w-8 h-8 text-green-600 dark:text-green-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              NFT Analysis
            </h3>
          </div>
          {getRiskBadge(data.riskLevel)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Contract
              </p>
              <button
                onClick={() => copyToClipboard(data.contractAddress)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="font-mono text-sm mt-1 break-all">
              {data.contractAddress}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Token ID</p>
            <p className="text-lg font-semibold mt-1">{data.tokenId}</p>
          </div>
        </div>

        <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
          <p className="text-xl font-semibold mt-1">{data.name}</p>
        </div>

        <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Description
          </p>
          <p className="mt-1 text-gray-700 dark:text-gray-300">
            {data.description}
          </p>
        </div>
      </div>

      {/* Metadata */}
      {data.metadata && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold mb-4">Metadata</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {data.metadata.collection && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Collection
                </p>
                <p className="font-medium mt-1">{data.metadata.collection}</p>
              </div>
            )}

            {data.metadata.owner && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Owner
                </p>
                <p className="font-mono text-sm mt-1">
                  {data.metadata.owner.slice(0, 6)}...
                  {data.metadata.owner.slice(-4)}
                </p>
              </div>
            )}

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verified
              </p>
              <div className="mt-1">
                {data.metadata.verified ? (
                  <span className="inline-flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center text-red-600 dark:text-red-400">
                    <XCircle className="w-4 h-4 mr-1" />
                    No
                  </span>
                )}
              </div>
            </div>
          </div>

          {data.metadata.attributes && data.metadata.attributes.length > 0 && (
            <div>
              <h5 className="font-medium mb-3">Attributes</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.metadata.attributes.slice(0, 6).map((attr, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {attr.trait_type || attr.type}
                    </p>
                    <p className="text-sm font-semibold mt-1">{attr.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Risk Factors */}
      {data.riskFactors.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-950 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
              Risk Factors
            </h4>
          </div>

          <div className="space-y-2">
            {data.riskFactors.map((factor, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-orange-700 dark:text-orange-300">{factor}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderResults = () => {
    if (!result) return null;

    switch (analysisType) {
      case "wallet":
        return renderWalletResult(result as WalletResult);
      case "collection":
        return renderCollectionResult(result as CollectionResult);
      case "nft":
        return renderNFTResult(result as NFTResult);
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto mt-10 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Web3 Risk Analyzer
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Analyze Ethereum wallets, NFT collections, and individual NFTs for
          security risks
        </p>
      </div>

      {/* Analysis Type Selector */}
      <div className="flex justify-center space-x-2 mb-8">
        <button
          onClick={() => setAnalysisType("wallet")}
          className={cn(
            "flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium",
            analysisType === "wallet"
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
        >
          <Wallet size={20} />
          <span>Wallet</span>
        </button>
        <button
          onClick={() => setAnalysisType("collection")}
          className={cn(
            "flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium",
            analysisType === "collection"
              ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
        >
          <Grid3X3 size={20} />
          <span>Collection</span>
        </button>
        <button
          onClick={() => setAnalysisType("nft")}
          className={cn(
            "flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium",
            analysisType === "nft"
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          )}
        >
          <Image size={20} aria-label="NFT icon" />
          <span>NFT</span>
        </button>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <PlaceholdersAndVanishInput
                placeholders={placeholders[analysisType]}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
              />
            </div>
            {analysisType === "nft" && (
              <input
                type="text"
                placeholder="Token ID"
                value={tokenId}
                onChange={handleTokenIdChange}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            )}
            <button
              onClick={handleAnalyzeClick}
              disabled={loading}
              className={cn(
                "px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center min-w-[120px]",
                loading
                  ? "bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </button>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            {analysisType === "wallet" &&
              "Enter an Ethereum wallet address to analyze tokens and NFTs for risks"}
            {analysisType === "collection" &&
              "Enter an NFT collection contract address to analyze holder distribution and risks"}
            {analysisType === "nft" &&
              "Enter an NFT contract address and token ID to analyze metadata and ownership"}
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          {renderResults()}
        </div>
      )}
    </div>
  );
}
