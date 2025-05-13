import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: `My Tasks`,
    template: `Spotlight`
  }
}

export default function TasksLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
} 