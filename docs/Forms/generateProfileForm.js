import fs from "fs";

const inputPath = "./myForm.txt";
const outputPath = "./ProfileForm.jsx";

// Read original form
let content = fs.readFileSync(inputPath, "utf8");

// Remove any nested <Form> tags (only keep Form.Item)
content = content
    .replace(/<Form([^>]+)>([\s\S]*?)<\/Form>/gi, "$2")
    .replace(/<\/?Form[^>]*>/gi, "");

// Add "label" prop to each Form.Item if missing
content = content.replace(
    /<Form\.Item([^>]*?)name\s*=\s*["']([^"']+)["']([^>]*)>/gi,
    (match, before, fieldName, after) => {
        if (/label\s*=/.test(match)) return match; // Skip if label already exists
        const cleanLabel = fieldName.replace(/([A-Z])/g, " $1").trim();
        return `<Form.Item label="${cleanLabel}"${before} name="${fieldName}"${after}>`;
    }
);

// Wrap everything in one clean Form layout
const finalComponent = `import React from "react";
import { Form, Input, Select, DatePicker, Checkbox, ConfigProvider } from "antd";

function ProfileForm() {
    return (
        <Form layout="vertical" name="profileForm">
${content
    .split("\n")
    .map(line => "        " + line) // 4-space indentation
    .join("\n")}
        </Form>
    );
}

export default ProfileForm;
`;

fs.writeFileSync(outputPath, finalComponent, "utf8");
console.log("✅ ProfileForm.jsx generated successfully!");
