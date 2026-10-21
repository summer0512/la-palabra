'use client';

import { Button } from "@/components/ui/button";
import './globals.css';

export default function NotFound() {
  return (
    <html lang="es">
    <body>
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="text-8xl font-bold">404</div>
        <h2 className="text-2xl font-semibold">Página no encontrada</h2>
        <p className="text-muted-foreground">Lo sentimos, no encontramos la página que estás buscando.</p>
        <Button asChild className="mt-4">
          <a href="/">Volver al inicio</a>
        </Button>
      </div>
    </div>
    </body>
    </html>
  );
}


