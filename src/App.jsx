import React, {useEffect,useState} from 'react';
import Search from "./Components/Search.jsx";
import Spiner from "./Components/Spiner.jsx";
import MovieCard from "./Components/MovieCard.jsx";
import {useDebounce} from "react-use";
import {getTrandingMovies, updateSearchCount} from "./appwrite.js";


const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
    }
}
const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [IsLoading, setIsLoading] = useState(false);
    const [debounceSearchTerm, setDebounceSearchTerm] = useState('');
    const [trendingMovies, setTrendingMovies] = useState([]);


    useDebounce(()=>setDebounceSearchTerm(searchTerm),500,[searchTerm]);

    const fetchData = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('')
        try{
            const endpoint = query ?`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`:`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
            const response = await fetch(endpoint, API_OPTIONS);

            if(!response.ok){
                throw new Error("Could not find movie?");
            }
            const movies = await response.json();

            if (movies.Response === 'False'){
                setErrorMessage(movies.ERROR || 'Failed fetch data')
                setMovieList([]);
                return;
            }
            setMovieList(movies.results || []);

            if(query && movies.results.length > 0){
                await updateSearchCount(query, movies.results[0])
            }

        }
        catch(e){
            console.error(`Error fetching data ${e}`);
            setErrorMessage('Error fetching movies please try again later...');
        }
        finally {
            setIsLoading(false);
        }
    }

    const loadingTrandingMovies = async () => {
        try {
            const movies = await getTrandingMovies()

            setTrendingMovies(movies)
        } catch (e) {
            console.error(`Cant find movie ${e}`);
        }
    }

    useEffect(() => {
        fetchData(searchTerm);
    },[debounceSearchTerm]);


    useEffect(() => {
        loadingTrandingMovies()
    },[]);

    return (
        <main>
            <div className="pattern"/>
            <div className="wrapper">
                <header>
                    <img src="./hero.png" alt="Hero Banner"/>
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {trendingMovies.length > 0 &&(
                    <section className="trending">
                        <h2>Trending movies</h2>
                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.$id}>
                                    <p>{index + 1}</p>
                                    <img src={movie.poster_url} alt={movie.title} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="all-movies">
                    <h2 >All movies </h2>
                    {IsLoading?(
                        <p className='text-green-600'>
                            <Spiner/>
                        </p>
                    ):errorMessage?(
                        <p className="text-red-800">
                            {errorMessage}
                        </p>
                    ):(
                        <ul>
                            {movieList.map((movie)=>(
                                <MovieCard key={movie.id} movie={movie}/>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    )
}

export default App;