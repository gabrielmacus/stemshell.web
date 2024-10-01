import { useDisclosure } from "@mantine/hooks";
import { createContext, useContext } from "react";

export interface DisclosureContextProps {
    open: () => void
    close: () => void
    toggle: () => void
}

const DisclosureContext = createContext<DisclosureContextProps>(undefined!)

export default function useDisclosureContext() {
    const context = useContext(DisclosureContext)
    if (!context)
        throw new Error('useDisclosureContext must be used within a DisclosureContext.Provider')
}