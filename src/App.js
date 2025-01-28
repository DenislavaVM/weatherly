import Search from "./components/search/Search";

function App() {

  const handleOnSearchChange = (searchData) => {
    console.log("Selected City Data:", searchData);
  };

  return (
    <div className="container">
      <Search onSearchChange={handleOnSearchChange} />
    </div>
  );
}

export default App;