export const metadata = {
  title: "TechTalks Career Mentor",
  description: "Career mentoring platform for TechTalks Group D",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
