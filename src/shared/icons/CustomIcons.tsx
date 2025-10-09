import { Icon, type IconProps } from "@chakra-ui/react";
import { ReactComponent as MuxifyIcon } from "@assets/icons/muxify-logo.svg";
import { ReactComponent as MusicDashboard } from "@assets/icons/music-dashboard.svg";
import { ReactComponent as ChartSquare } from "@assets/icons/chart-square.svg";
import { ReactComponent as Artist } from "@assets/icons/Artist.svg";
import { ReactComponent as GalleryAdd } from "@assets/icons/gallery-add.svg";
import { ReactComponent as Verify } from "@assets/icons/verify.svg";

// Muxify Logo Icon
const MuxifyLogoIcon: React.FC<IconProps> = (props) => (
    <Icon as={MuxifyIcon} {...props} />
);

// Music Dashboard Icon (for Artist, Creators & DJs)
const MusicDashboardIcon: React.FC<IconProps> = (props) => (
    <Icon as={MusicDashboard} {...props} />
);

// Chart Square Icon (for Ad Manager)
const ChartSquareIcon: React.FC<IconProps> = (props) => (
    <Icon as={ChartSquare} {...props} />
);

// Artist Icon (for Recording & Distribution Company)
const ArtistIcon: React.FC<IconProps> = (props) => (
    <Icon as={Artist} {...props} />
);

// Gallery Add Icon (for Display Picture)
const GalleryAddIcon: React.FC<IconProps> = (props) => (
    <Icon as={GalleryAdd} {...props} />
);

// Verify Icon (for Identity Verification)
const VerifyIcon: React.FC<IconProps> = (props) => (
    <Icon as={Verify} {...props} />
);

export default MuxifyLogoIcon;
export {
    MuxifyLogoIcon,
    MusicDashboardIcon,
    ChartSquareIcon,
    ArtistIcon,
    GalleryAddIcon,
    VerifyIcon
};
