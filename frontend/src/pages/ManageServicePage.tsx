import ServiceForm from "../components/ServiceForm.tsx";
import {Box} from "@mui/material";

export default function ManageServicePage() {
    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <ServiceForm />
        </Box>
    );
}
