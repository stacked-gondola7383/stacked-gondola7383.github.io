import React from "react";
import Layout from "@theme/Layout";
import BrowserOnly from "@docusaurus/BrowserOnly";

export default function PlaygroundPage() {
  return (
    <Layout title="Playground" description="Write and run E7 in your browser: the real compiler and VM, compiled to WebAssembly." noFooter>
      <BrowserOnly fallback={<div style={{ padding: 40 }}>Loading the playground…</div>}>
        {() => {
          const Playground = require("@site/src/components/Playground").default;
          return <Playground />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
