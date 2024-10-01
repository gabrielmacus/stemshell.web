import { AppShell, Burger } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks";
import ColorSchemeToggler from "../misc/ColorSchemeToggler";

export interface AdminLayoutProps {
    children: React.ReactNode
}

export default function AdminLayout(props: AdminLayoutProps) {
    const [opened, { toggle }] = useDisclosure();

    return <AppShell
        header={{ height: 60 }}
        navbar={{
            width: 300,
            breakpoint: 'sm',
            collapsed: { mobile: !opened },
        }}
        padding="md"
    >
        <AppShell.Header>
            <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
            />
            <div>Logo</div>
            <ColorSchemeToggler />
        </AppShell.Header>
        <AppShell.Navbar p="md">Navbar</AppShell.Navbar>


        <AppShell.Main>
            {props.children}
        </AppShell.Main>
    </AppShell>
}