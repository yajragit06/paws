import { Component, type ReactNode } from "react";
import { clinic } from "../../data/clinic";

/** Shows a friendly fallback instead of a blank page if something breaks. */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-extrabold">Something went wrong on this page</h1>
        <p className="mt-2 text-muted">
          Please refresh, or call us on{" "}
          <a href={clinic.phoneHref} className="font-semibold text-brand-dark">{clinic.phone}</a>.
        </p>
      </div>
    );
  }
}
