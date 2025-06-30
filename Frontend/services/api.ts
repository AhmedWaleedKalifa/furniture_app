// export const TMDB_CONFIG={
//     BASE_URL:"https://api.themoviedb.org/3",
//     API_KEY:process.env.EXPO_PUBLIC_MOVIE_API_KEY,
//     headers:{
//         accept:'application/json',
//         Authorization:`Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`
//     }
// }



export const fetchFurniture = async (): Promise<Product[]> => {
    const endpoint = `${process.env.EXPO_PUBLIC_BASE_URL}/api/products`
    

    console.log("Fetching from endpoint:", endpoint); 
    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            accept: 'application/json',
        }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch furniture ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
}

export const fetchFurnitureDetails = async (id:string): Promise<ProductDetails> => {
    const endpoint = `${process.env.EXPO_PUBLIC_BASE_URL}/api/products/${id}`

    console.log("Fetching from endpoint:", endpoint); 

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            accept: 'application/json',
        }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch furniture ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
}





// export const fetchMovieDetails= async(movieId:string):Promise<MovieDetails>=>{
//     try{
//         const response=await fetch(`${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`,{
//             method:"Get",
//             headers:TMDB_CONFIG.headers
//         })
//         if(!response.ok)throw new Error("Failed to fetch movie data")
//         const data=await response.json();
//         return data;
//     }catch(error){
//         console.log(error);
//         throw error;
//     }
// }

//export const fetchMovies=async({query}:{query:string})=>{
    //     const endpoint = query
    //     ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
    //     : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc`;
    
    //     const response=await fetch(endpoint,{
    //         method:'GET',
    //         headers:TMDB_CONFIG.headers
    //     })
    //     if(!response.ok){
    //         throw new Error(`Failed to fetch movies ${response.statusText}` )
    //     }
    //     const data=await response.json();
    //     return data.results;
    // }