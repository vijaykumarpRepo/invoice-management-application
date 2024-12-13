module.exports = {
    root: true,
    extends: [
      "next/core-web-vitals",
      "plugin:@typescript-eslint/recommended",
    ],
    rules: {
      "no-console": "off", // Allow console.logs
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" }, // Ignore variables starting with "_"
      ],
      "react/react-in-jsx-scope": "off", // Disable React in scope
      "@next/next/no-img-element": "off", // Allow <img> tags
    },
  };
  