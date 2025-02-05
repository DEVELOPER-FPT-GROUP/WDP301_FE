import { Button, Group, Text, Title } from "@mantine/core";

export function GeneralError() {
	return (
		<div
			className={
				"bg-[var(--mantine-color-blue-filled)] h-screen w-screen flex items-center justify-center"
			}
		>
			<div>
				<div className="text-center font-extrabold text-[220px] leading-[1] mb-[calc(var(--mantine-spacing-xl)*1.5)] text-[var(--mantine-color-blue-3)] sm:text-[120px]">
					403
				</div>
				<Title className="font-[Greycliff CF,var(--mantine-font-family)] text-center font-extrabold text-[38px] text-[var(--mantine-color-white)] sm:text-[32px]">
					Permission denied!
				</Title>
				<Text
					size="lg"
					ta="center"
					className="max-w-[540px] mx-auto mt-[var(--mantine-spacing-xl)] mb-[calc(var(--mantine-spacing-xl)*1.5)] text-[var(--mantine-color-blue-1)]"
				>
					You don't have permission to access this page. Please contact
					administrator for more information.
				</Text>
				<Group className="justify-center">
					<Button
						variant="transparent"
						size="md"
						onClick={() => {
							window.location.href = "/";
						}}
						autoContrast={true}
						className={"text-white"}
					>
						Take me back to home page
					</Button>
				</Group>
			</div>
		</div>
	);
}
