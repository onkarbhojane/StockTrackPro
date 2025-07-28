export const Data = Array.from({ length: 200 }, (_, index) => {
  const time = index;
  return {
    id: index + 1,
    time, // Random between 3,000 and 100,000
    price: Math.floor(Math.random() * (1200 - 500 + 1)) + 100, // Random between 100 and 5,000
  };
});
