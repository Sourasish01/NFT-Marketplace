
const Button = (props) => { // Removed : ButtonProps type annotation
  const { loading, disabled, children, ...rest } = props;

  return (
    <button
      className="h-12 rounded-lg bg-black px-4 py-2 text-xl font-semibold text-white"
      disabled={disabled || loading} // disabled prop from ButtonHTMLAttributes or passed explicitly
      {...rest} // Spreads any other standard button attributes (like onClick, type, etc.)
    >
      {loading ? "Busy..." : children}
    </button>
  );
};

export default Button;