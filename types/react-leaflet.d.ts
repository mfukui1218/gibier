// types/react-leaflet.d.ts
import "react-leaflet";
import type {
  LatLngExpression,
  LatLngBoundsExpression,
  MapOptions,
  TileLayerOptions,
  Icon,
  DivIcon,
} from "leaflet";

declare module "react-leaflet" {
  interface MapContainerProps {
    center?: LatLngExpression;
    zoom?: number;
    minZoom?: MapOptions["minZoom"];
    maxZoom?: MapOptions["maxZoom"];
    maxBounds?: LatLngBoundsExpression;
    maxBoundsViscosity?: MapOptions["maxBoundsViscosity"];
  }

  interface TileLayerProps {
    url?: string;
    attribution?: string;
    opacity?: TileLayerOptions["opacity"];
    zIndex?: TileLayerOptions["zIndex"];
  }

  interface MarkerProps {
    position: LatLngExpression;
    icon?: Icon | DivIcon;
  }
}
