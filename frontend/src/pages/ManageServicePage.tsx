import ServiceForm from "../components/ServiceForm.tsx";
import {Box} from "@mui/material";
import Header from "../components/Header.tsx";

export default function ManageServicePage() {
    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <Header />
            <ServiceForm />
        </Box>
    );
}
