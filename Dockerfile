# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1: Build the WebAssembly module with wasm-pack
# ---------------------------------------------------------------------------
FROM rust:1-alpine AS builder

# Install wasm-pack (pulls in the wasm32 target + wasm-opt automatically)
RUN cargo install wasm-pack --locked

WORKDIR /app

# Copy the workspace so cargo can resolve the workspace / path dependencies
COPY . .

# Build the wasm crate and emit the browser-target package into wasm/pkg
RUN wasm-pack build --target web --out-dir pkg wasm

# ---------------------------------------------------------------------------
# Stage 2: Assemble the static web site and serve it with nginx
# ---------------------------------------------------------------------------
FROM nginx:alpine

# Copy the generated wasm bindings into nginx's default web root
COPY --from=builder /app/wasm/pkg/wasm.js      /usr/share/nginx/html/wasm.js
COPY --from=builder /app/wasm/pkg/wasm_bg.wasm /usr/share/nginx/html/wasm_bg.wasm

# Copy the rest of the static web site (index.html, index.js, styles.css, roms/)
COPY web/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
