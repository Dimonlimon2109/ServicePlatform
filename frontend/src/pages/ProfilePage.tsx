import Profile from "../components/Profile";
import {Box} from "@mui/material";
import Header from "../components/Header.tsx";

export default function ProfilePage() {
    return (
        <Box display="flex" flexDirection="column" minHeight="100vh">
            <Header />
            <Profile />
        </Box>
    );
}
