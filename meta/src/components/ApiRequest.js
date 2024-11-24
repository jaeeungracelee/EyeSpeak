export const ApiRequest = async (url, data) => {
  const url = "https://example.org/products.json";
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ username: "example" }),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);
  } catch (error) {
    console.error(error.message);
  }
};
