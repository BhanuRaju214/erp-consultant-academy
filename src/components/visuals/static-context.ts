"use client";

import { createContext, useContext } from "react";

/**
 * True when visuals are rendered for a static export (images for an external LMS).
 * Interactive blocks then show everything at once instead of waiting for clicks.
 */
export const StaticRenderContext = createContext(false);
export const useStaticRender = () => useContext(StaticRenderContext);
