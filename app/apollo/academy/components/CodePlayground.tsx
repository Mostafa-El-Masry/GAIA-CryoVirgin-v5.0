"use client";

import { useEffect, useState } from "react";

type CodePlaygroundProps = {
  initialCode?: string;
  language?: "html" | "css" | "js";
};

const CodePlayground = ({
  initialCode = "",
  language = "html",
}: CodePlaygroundProps) => {
  const [code, setCode] = useState(initialCode);
  const [previewDoc, setPreviewDoc] = useState("");

  useEffect(() => {
    if (language === "html") {
      setPreviewDoc(code);
    } else if (language === "css") {
      setPreviewDoc(
        `<!DOCTYPE html><html><head><style>${code}</style></head><body><div class="preview-target">Preview area</div></body></html>`
      );
    } else {
      setPreviewDoc(
        `<!DOCTYPE html><html><head></head><body><pre>JS preview is basic here. Focus on the code behaviour, not the visual output.</pre><script>${code}<\/script></body></html>`
      );
    }
  }, [code, language]);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1">
        <p className="text-[11px] sm:text-xs gaia-muted">Your code</p>
        <textarea
          className="gaia-input h-40 w-full rounded-xl border gaia-border p-2 text-xs sm:text-sm shadow-sm gaia-focus"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <p className="text-[11px] sm:text-xs gaia-muted">Preview</p>
        <div className="h-40 w-full overflow-hidden rounded-xl border gaia-border gaia-ink-soft">
          <iframe
            title="Code preview"
            className="h-full w-full border-0"
            srcDoc={previewDoc}
          />
        </div>
      </div>
    </div>
  );
};

export default CodePlayground;
