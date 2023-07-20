import { render } from "react-dom";
import React from "react";
import { Provider } from "react-redux";
import { rootStore } from "../../shared/store";
import { ATNDecoderContainer } from "./ATNDecoderContainer/ATNDecoderContainer";
import { ErrorBoundary } from "../../inspector/components/ErrorBoundary/ErrorBoundary";

export function renderATNDecoderUI(): void {
  const el = document.querySelector("[panelid=occultist]");
  if (!el) {
    console.error(el);
  }

  render(
    <Provider store={rootStore}>
      <ErrorBoundary>
        <ATNDecoderContainer />
      </ErrorBoundary>
    </Provider>,
    el as HTMLElement,
  );
}
