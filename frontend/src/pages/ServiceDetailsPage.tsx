import ServiceDetails from "../components/ServiceDetails";
import {Box} from "@mui/material";

export default function ServiceDetailsPage() {
    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <ServiceDetails />
        </Box>
    );
}
