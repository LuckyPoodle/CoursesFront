import { useState, useEffect,useContext } from "react";
import axios from "axios";
import InstructorRoute from "../../../components/routes/InstructorRoute";
import CourseCreateForm from "../../../components/forms/CourseCreateForm";
import Resizer from "react-image-file-resizer";
import { toast } from "react-toastify";
import { Context } from "../../../context";
import { useRouter } from "next/router";



const CourseCreate = () => {
  // state
  const [values, setValues] = useState({
    name: "",
    description: "",
    price: "9.99",
    uploading: false,
    paid: true,
    category: "",
    loading: false,
  });
  const [image, setImage] = useState({});
  const [preview, setPreview] = useState("");
  const [uploadButtonText, setUploadButtonText] = useState("Upload Image");

 
    // router
    const router = useRouter();

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    let file = e.target.files[0];
    setPreview(window.URL.createObjectURL(file));
    setUploadButtonText(file.name);
    setValues({ ...values, loading: true });

    // resize
    Resizer.imageFileResizer(file, 720, 500, "JPEG", 100, 0, async (uri) => {
      try {
        let { data } = await axios.post("/api/course/upload-image", {
          image: uri,
        });
        console.log("IMAGE UPLOADED", data);
        // set image in the state
        setImage(data);
        setValues({ ...values, loading: false });
      } catch (err) {
        console.log(err);
        setValues({ ...values, loading: false });
        toast("Image upload failed. Try later.");
      }
    });
  };

  const handleImageRemove=async()=>{
    console.log("REMOVE IMAGE");
    try{
      const res=await axios.post('/api/course/remove-image',{image});
      setImage({})
      setPreview("");
      setUploadButtonText("Upload Image")
    }catch(err){
      setValues({...values,loading:false});
      toast("Image Removal failed. Please try again");

    }


  }

  const handleSubmit =async(e) => {
    e.preventDefault();
    console.log(values);
    try{
      //if key value same can jus put the value
    const {data}=await axios.post('/api/course/create',{...values,image});
      toast ('Course is created! You can start adding lessons');
      router.push('/instructor');
    }catch(err){
      toast(err.response.data);

    }


  };

  return (
    <InstructorRoute>
      <h1 className="jumbotron text-center square">Create Course</h1>
      <div className="pt-3 pb-3">
        <CourseCreateForm
          handleSubmit={handleSubmit}
          handleImage={handleImage}
          handleChange={handleChange}
          handleImageRemove={handleImageRemove}
          values={values}
          setValues={setValues}
          preview={preview}
          uploadButtonText={uploadButtonText}
        />
      </div>
      <pre>{JSON.stringify(values, null, 4)}</pre>
      <pre>{JSON.stringify(image,null,4)}</pre>
    </InstructorRoute>
  );
};

export default CourseCreate;
