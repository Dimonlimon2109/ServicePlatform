import { Box } from "@mui/material";
import Catalog from "../components/Catalog";
import Header from "../components/Header.tsx";

export default function CatalogPage() {
    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <Header />
            <Catalog />
        </Box>
    );
}
