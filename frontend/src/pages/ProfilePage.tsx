import Profile from "../components/Profile";
import {Box} from "@mui/material";

export default function ProfilePage() {
    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <Profile />
        </Box>
    );
}
