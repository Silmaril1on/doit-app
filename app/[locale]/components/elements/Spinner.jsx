const Spinner = ({ size = 14 }) => (
  <span
    style={{ width: size, height: size }}
    className="inline-block shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin"
  />
);

export default Spinner;
