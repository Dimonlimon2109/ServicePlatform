import { Box } from "@mui/material";
import Catalog from "../components/Catalog";

export default function CatalogPage() {
    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <Catalog />
        </Box>
    );
}
