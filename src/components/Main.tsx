import { useEffect, useState } from "react";
import { ScanButton } from "./ScanButton.tsx";
import { PlayingView } from "./PlayingView.tsx";
import { ErrorView } from "./ErrorView.tsx";
import { QrScanner } from "@yudiel/react-qr-scanner";
import { LoadingIcon } from "./icons/LoadingIcon.tsx";

interface MainProps {
  accessToken: string;
  resetTrigger: number;
  isActive: (active: boolean) => void;
}

function Main({ accessToken, resetTrigger, isActive }: MainProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (isScanning || isError || scannedUrl) {
      isActive(true);
    } else {
      isActive(false);
    }
  }, [isScanning, isError, scannedUrl]);

  useEffect(() => {
    if (resetTrigger > 0) {
      resetToStart();
    }
  }, [resetTrigger]);

  useEffect(() => {
    if (scannedUrl && accessToken) {
      const spotifyUri = scannedUrl
        .replace("https://open.spotify.com/track/", "spotify:track:")
        .split("?")[0];

      fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: "PUT",
        body: JSON.stringify({ uris: [spotifyUri] }),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    }
  }, [scannedUrl]);

  const handleScan = (result: string) => {
    if (result?.startsWith("https://open.spotify.com/")) {
      setScannedUrl(result);
      setIsScanning(false);
    } else {
      setIsError(true);
      setIsScanning(false);
    }
  };

  const handleError = (error: Error) => {
    console.error(error);
    setIsError(true);
    setIsScanning(false);
  };

  const resetScanner = () => {
    setScannedUrl(null);
    setIsError(false);
    setIsScanning(true);
    fetch(`https://api.spotify.com/v1/me/player/pause`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
  };

  const resetToStart = () => {
    setScannedUrl(null);
    setIsError(false);
    setIsScanning(false);
    fetch(`https://api.spotify.com/v1/me/player/pause`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

  };

  if (isError) {
    return <ErrorView onRetry={resetScanner} />;
  }

  if (scannedUrl) {
    return <PlayingView onReset={resetToStart} onScanAgain={resetScanner} />;
  }

  return isScanning ? (
    <div className="w-full max-w-md rounded-lg overflow-hidden shadow-2xl shadow-[#1DB954]/20">
      <QrScanner
        onDecode={handleScan}
        onError={handleError}
        scanDelay={500}
        hideCount
        audio={false}
        constraints={{
          facingMode: "environment",
        }}
      />
    </div>
  ) : (
    <>
      <ScanButton onClick={() => setIsScanning(true)} />
      <a
        className="text-[#1DB954] font-bold hover:text-[#1ed760] text-center mt-16"
        href="https://www.blindsongscanner.com"
      >
        About
      </a>
    </>
  )
}

export default Main;
