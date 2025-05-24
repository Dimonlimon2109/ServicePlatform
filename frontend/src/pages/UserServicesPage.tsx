import UserServices from '../components/UserServices';
import {Box} from "@mui/material";

export default function UserServicesPage() {
    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <UserServices />
        </Box>
    );
}
