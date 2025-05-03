import ServiceDetails from "../components/ServiceDetails";
import {Box} from "@mui/material";
import Header from "../components/Header.tsx";

export default function ServiceDetailsPage() {
    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <Header />
            <ServiceDetails />
        </Box>
    );
}
