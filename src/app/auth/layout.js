// app/(auth)/layout.jsx
export const metadata = {
    title: 'تسجيل الدخول — متجر',
  };
  
  export default function AuthLayout({ children }) {
    // هنا لا نضع header/sidebar؛ نُعيد المحتوى كما هو
    return (
      <html lang="ar" dir="rtl">
        <body className="bg-slate-50">
          {children}
        </body>
      </html>
    );
  }
  