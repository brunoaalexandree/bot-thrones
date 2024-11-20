const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseURL =
  "https://questlog.gg/throne-and-liberty/api/trpc/database.getItems";

const language = "en";
const mainCategory = "";
const subCategory = "";
const transformIconPath = (iconPath) => {
  const baseCDN = "https://cdn.questlog.gg/throne-and-liberty";

  const dirname = path.dirname(iconPath);
  const basename = path.basename(iconPath).split(".")[0];

  return `${baseCDN}${dirname}/${basename}.webp`;
};
const fetchPage = async (page) => {
  const input = {
    language,
    page,
    mainCategory,
    subCategory,
  };

  const inputParam = encodeURIComponent(JSON.stringify(input));

  const url = `${baseURL}?input=${inputParam}`;

  try {
    const response = await axios.get(url);
    if (response.data && response.data.result && response.data.result.data) {
      const { pageData, pageCount, currentPage } = response.data.result.data;
      return { pageData, pageCount, currentPage };
    } else {
      console.error(`Estrutura de resposta inválida para a página ${page}`);
      return { pageData: [], pageCount: 0, currentPage: page };
    }
  } catch (error) {
    console.error(`Erro ao buscar a página ${page}:`, error.message);
    return { pageData: [], pageCount: 0, currentPage: page };
  }
};
const main = async () => {
  let allItems = [];

  const firstPage = await fetchPage(1);
  allItems = allItems.concat(firstPage.pageData);

  const pageCount = firstPage.pageCount || 1;

  console.log(`Total de páginas a serem buscadas: ${pageCount}`);

  for (let page = 2; page <= pageCount; page++) {
    const pageResult = await fetchPage(page);
    allItems = allItems.concat(pageResult.pageData);
    console.log(`Página ${page} de ${pageCount} buscada com sucesso.`);

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  allItems = allItems.map((item) => {
    if (item.icon) {
      item.icon = transformIconPath(item.icon);
    }
    return item;
  });

  fs.writeFile("items.json", JSON.stringify(allItems, null, 2), (err) => {
    if (err) {
      console.error("Erro ao escrever no arquivo items.json:", err);
    } else {
      console.log(
        `Sucesso! ${allItems.length} itens foram salvos em items.json`
      );
    }
  });
};

main();
