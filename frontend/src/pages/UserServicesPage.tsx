import UserServices from '../components/UserServices';
import {Box} from "@mui/material";
import Header from "../components/Header.tsx";

export default function UserServicesPage() {
    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <Header />
            <UserServices />
        </Box>
    );
}
