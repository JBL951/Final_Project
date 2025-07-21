import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Printer } from "lucide-react";
import { type Recipe } from "@shared/schema";

interface ExportRecipeProps {
  recipe: Recipe;
}

export function ExportRecipe({ recipe }: ExportRecipeProps) {
  const exportAsText = () => {
    const textContent = `
${recipe.title}
${"=".repeat(recipe.title.length)}

Description: ${recipe.description}
Cook Time: ${recipe.cookTime}
Tags: ${recipe.tags.join(", ")}

INGREDIENTS:
${recipe.ingredients.map(ingredient => `• ${ingredient}`).join("\n")}

INSTRUCTIONS:
${recipe.instructions.map((instruction, index) => `${index + 1}. ${instruction}`).join("\n")}

---
Generated from TasteBase
    `.trim();

    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${recipe.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printRecipe = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${recipe.title}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .meta { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 8px; }
        .ingredients, .instructions { margin: 20px 0; }
        .ingredients ul, .instructions ol { padding-left: 20px; }
        .ingredients li, .instructions li { margin: 5px 0; line-height: 1.6; }
        .tags { margin: 10px 0; }
        .tag { background: #e2e8f0; padding: 2px 8px; border-radius: 12px; display: inline-block; margin: 2px; font-size: 12px; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <h1>${recipe.title}</h1>
    <div class="meta">
        <p><strong>Description:</strong> ${recipe.description}</p>
        <p><strong>Cook Time:</strong> ${recipe.cookTime}</p>
        <div class="tags">
            <strong>Tags:</strong> ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
        </div>
    </div>
    
    <div class="ingredients">
        <h2>Ingredients</h2>
        <ul>
            ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join("")}
        </ul>
    </div>
    
    <div class="instructions">
        <h2>Instructions</h2>
        <ol>
            ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join("")}
        </ol>
    </div>
    
    <p style="margin-top: 40px; color: #666; font-size: 12px; border-top: 1px solid #ccc; padding-top: 10px;">
        Generated from TasteBase - Recipe Sharing Platform
    </p>
</body>
</html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsText}>
          <FileText className="w-4 h-4 mr-2" />
          Export as Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={printRecipe}>
          <Printer className="w-4 h-4 mr-2" />
          Print Recipe
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}