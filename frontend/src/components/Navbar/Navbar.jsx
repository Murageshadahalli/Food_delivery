import React, { useContext, useState, useEffect } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({setShowLogin, onSearch}) => {

  const [menu,setMenu] = useState("menu");
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showNoResults, setShowNoResults] = useState(false);

  const {getTotalCartAmount,token,setToken,clearCart,food_list} = useContext(StoreContext);

  const navigate = useNavigate();

  const logout = ()=>{
    localStorage.removeItem("token");
    setToken("");
    clearCart(); // Clear cart items when logging out
    navigate("/")
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setShowNoResults(false);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const results = food_list.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );

    setSearchResults(results);
    
    if (results.length === 0) {
      setShowNoResults(true);
      setTimeout(() => setShowNoResults(false), 5000);
    } else {
      setShowNoResults(false);
    }
  }

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowNoResults(false);
  }

  const handleSearchIconClick = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      clearSearch();
    }
  }

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSearch && !event.target.closest('.search-container')) {
        setShowSearch(false);
        clearSearch();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch]);

  return (
    <div className='navbar'>
       <Link to='/'><img src={assets.logo} alt='logo' className='logo' /></Link>
       <ul className='navbar-menu'>
         <Link to='/' onClick={() => setMenu("home")} className={menu==="home"?"active":""}>Home</Link>
         <a href='#explore-menu' onClick={() => setMenu("menu")} className={menu==="menu"?"active":""}>Menu</a>
         <a href='#app-download' onClick={() => setMenu("mobile-app")} className={menu==="mobile-app"?"active":""}>Mobile-app</a>
         <a href='#footer' onClick={() => setMenu("contact-us")} className={menu==="contact-us"?"active":""}>Contact us</a>
       </ul>
       <div className='navbar-right'>
        <div className="search-container">
          <img 
            src={assets.search_icon} 
            alt='search' 
            className={`navbar-icon ${showSearch ? 'active' : ''}`}
            onClick={handleSearchIconClick}
          />
          
          {/* Search Modal */}
          {showSearch && (
            <div className="search-modal">
              <div className="search-modal-content">
                <div className="search-header">
                  <h3>Search for your favorite dishes</h3>
                  <button className="close-search" onClick={() => setShowSearch(false)}>✕</button>
                </div>
                
                <form onSubmit={handleSearch} className="search-form">
                  <div className="search-input-wrapper">
                    <img src={assets.search_icon} alt="search" className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search for dishes, categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                      autoFocus
                    />
                    {searchTerm && (
                      <button type="button" onClick={clearSearch} className="clear-search">
                        ✕
                      </button>
                    )}
                  </div>
                  <button type="submit" className="search-button">Search</button>
                </form>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="search-results">
                    <h4>Found {searchResults.length} item(s)</h4>
                    <div className="results-list">
                      {searchResults.map((item, index) => (
                        <div key={index} className="result-item" onClick={() => {
                          setShowSearch(false);
                          clearSearch();
                          // Scroll to food display section
                          document.getElementById('food-display')?.scrollIntoView({ behavior: 'smooth' });
                        }}>
                          <img src={`http://localhost:4000/images/${item.image}`} alt={item.name} />
                          <div className="result-info">
                            <h5>{item.name}</h5>
                            <p>{item.description}</p>
                            <span className="result-category">{item.category}</span>
                          </div>
                          <span className="result-price">${item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results Notification */}
                {showNoResults && (
                  <div className="no-results-notification">
                    <div className="no-results-content">
                      <div className="no-results-icon">🔍</div>
                      <h4>No dishes found!</h4>
                      <p>We couldn't find any dishes matching "{searchTerm}"</p>
                      <div className="no-results-suggestions">
                        <p>Try searching for:</p>
                        <ul>
                          <li>Different keywords</li>
                          <li>Popular dishes like "Pizza", "Burger", "Pasta"</li>
                          <li>Categories like "Fast Food", "Desserts"</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className='navbar-search-icon'>
          <Link to='/cart'><img src={assets.basket_icon} alt=""/></Link>
          <div className={getTotalCartAmount()===0?"":"dot"}></div>
        </div>
        {!token?<button onClick={()=> setShowLogin(true)}>sing in</button>
        : <div className='navbar-profile'>
          <img src={assets.profile_icon} alt="" />
          <ul className="nav-profile-dropdwon">
            <li onClick={()=>navigate('/myorders')}><img src={assets.bag_icon} alt="" /><p>Orders</p></li>
            <hr />
            <li onClick={logout}><img src={assets.logout_icon} alt="" />Logout</li>
          </ul>

        </div>}
        

       </div>
    </div>
  )
}

export default Navbar
