import { useReducer, createContext,useEffect } from "react";
import axios from 'axios';
import { useRouter } from "next/router";
// initial state
const intialState = {
  user: null,
};

// create context
const Context = createContext();

// root reducer
const rootReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, user: null };
    default:
      return state;
  }
};

// context provider
const Provider = ({ children }) => {

  const [state, dispatch] = useReducer(rootReducer, intialState);


  const router=useRouter();
  //so even if refresh and info in Context is lost when page reloads
  useEffect(() => {
    dispatch({
      type:"LOGIN",
      payload:JSON.parse(window.localStorage.getItem("user")),
    })
  }, []);



  //whenever we get the response we wanna execute this code to handle expired token    
  axios.interceptors.response.use(
    function(response){
      //any status code that lie within the range of 2xx will trigger this function
      return response;
    },function(error){
      //any status code that falls outside the range of 2xx will trigger this function
      console.log(error);
      let response=error.response;
      console.log("RESPONSE ERROR");
      console.log(response);
      if (response.status==401 && response.config && !response.config.__isRetryRequest){
        return new Promise((resolve,reject)=>{
          axios.get('/api/logout')
          .then((data)=>{
            console.log("/401 error");
            dispatch({
              type:'LOGOUT'
            });
            window.localStorage.removeItem("user");
            router.push("/login")

          }).catch(err=>{
            console.log("AXIOS INTERCEPTOR ERROR",err);
            reject(error);
          })
        })
      }
      //because we r still in function handling error
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const getCsrfToken=async ()=>{
      const {data}=await axios.get('/api/csrf-token');
      //mentioned in the csrf library we installed
      console.log("CSRF",data)
      axios.defaults.headers['X-CSRF-Token']=data.csrfToken;

    };
    getCsrfToken(); //include thhe token in header each time we make request using axios
  }, []);



  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
};

export { Context, Provider };
