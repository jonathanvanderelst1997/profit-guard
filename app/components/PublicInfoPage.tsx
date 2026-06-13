import type { CSSProperties, ReactNode } from "react";

type PublicInfoPageProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
};

const styles = {
  shell: {
    minHeight: "100vh",
    background: "#f4f6f8",
    color: "#151515",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "28px 24px 72px",
  },
  header: {
    alignItems: "center",
    display: "flex",
    gap: 20,
    justifyContent: "space-between",
    margin: "0 auto 56px",
    maxWidth: 920,
  },
  brand: {
    alignItems: "center",
    color: "inherit",
    display: "inline-flex",
    fontWeight: 800,
    gap: 10,
    textDecoration: "none",
  },
  mark: {
    alignItems: "center",
    background: "#1f7a4d",
    borderRadius: 8,
    color: "#fff",
    display: "inline-flex",
    fontWeight: 900,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  nav: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
    color: "#5f6368",
    fontSize: 14,
  },
  main: {
    background: "#fff",
    border: "1px solid #d7d9dc",
    borderRadius: 8,
    lineHeight: 1.62,
    margin: "0 auto",
    maxWidth: 920,
    padding: "34px",
  },
  eyebrow: {
    color: "#1f7a4d",
    fontSize: 14,
    fontWeight: 750,
    margin: "0 0 10px",
  },
  title: {
    fontSize: "clamp(34px, 5vw, 54px)",
    lineHeight: 1,
    margin: "0 0 22px",
  },
  content: {
    color: "#3f454b",
    fontSize: 16,
  },
} satisfies Record<string, CSSProperties>;

export function PublicInfoPage({ title, eyebrow = "Profit Guard", children }: PublicInfoPageProps) {
  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <a style={styles.brand} href="/">
          <span style={styles.mark}>P</span>
          <span>Profit Guard</span>
        </a>
        <nav style={styles.nav}>
          <a href="/beta">Beta</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/refund">Refunds</a>
          <a href="/support">Support</a>
        </nav>
      </header>
      <main style={styles.main}>
        <p style={styles.eyebrow}>{eyebrow}</p>
        <h1 style={styles.title}>{title}</h1>
        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
}
