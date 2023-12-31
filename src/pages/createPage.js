import React, { useEffect } from "react";
import { Context } from "../utils/context";
import { addDoc, collection, count, setDoc } from "firebase/firestore";
import { auth, db, storage } from "../utils/firebase-utils";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

function CreateBlog() {
  const navigate = useNavigate();
  const { state, dispatch, name } = Context();
  const { CONTENTS_, TITLE_, DESCRIPTION_, FILE_ } = name;

  const createBlog = async () => {
    const blogData = {
      title: state.Title,
      desc: state.Description,
      content: state.Content,
      order: state.ArrayDB.length + 1,
      posted: new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date()),
      countDate: state.CountDate,
      author: {
        name: auth.currentUser.displayName,
        id: auth.currentUser.uid,
      },
    };

    const user = auth.currentUser.email;
    const validEmails = [
      "janrusselgorembalem2@gmail.com",
      "janrusselgorembalem3@gmail.com",
      "janrusselgorembalem4@gmail.com",
    ];

    const dataCollect = () => {
      if (validEmails.find((use) => user === use)) {
        return collection(db, "contents");
      }
      return collection(db, "public");
    };
    console.log(dataCollect());

    const docRef = await addDoc(dataCollect(), blogData);

    const imageRef = ref(storage, `cover/${state.ArrayDB.length}`);
    await uploadBytes(imageRef, state.File);

    const downloadURL = await getDownloadURL(imageRef);

    await setDoc(docRef, { pic: downloadURL }, { merge: true });

    navigate("/");
  };

  const TitleHandler = (e) => {
    dispatch({
      type: TITLE_,
      payload: e.target.value,
    });
  };

  const DescHandler = (e) => {
    dispatch({ type: DESCRIPTION_, payload: e.target.value });
  };

  const ContentHandler = (e) => {
    dispatch({ type: CONTENTS_, payload: e.target.value });
  };

  const File = (e) => {
    dispatch({ type: FILE_, payload: e.target.files[0] });
  };

  useEffect(() => {
    if (!state.isAuth) {
      navigate("/login");
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 mt-20">
      <h1 className="text-2xl font-semibold">Create a Post</h1>
      <div className="flex flex-col items-center gap-5 text-xl w-full ">
        <div className="w-full">
          <label className="flex flex-col">
            <h1>Image Cover</h1>
            <input onChange={File} type="file" required />
          </label>
        </div>

        <div className="w-full">
          <label>
            Title:
            <input
              className="w-full border border-slate-900 p-1 rounded"
              onChange={TitleHandler}
              type="text"
              required
            />
          </label>
        </div>

        <div className="w-full">
          <label>
            Description:
            <input
              className="w-full border border-slate-900 p-1 rounded"
              onChange={DescHandler}
              type="text"
              required
            />
          </label>
        </div>

        <div className="w-full">
          <label>
            Content:
            <textarea
              className="w-full border border-slate-900 p-1 h-[15rem] rounded resize-none"
              onChange={ContentHandler}
              required
            />
          </label>
        </div>
        <button
          className="bg-black px-1 rounded text-white"
          onClick={createBlog}
        >
          Post
        </button>
      </div>
    </div>
  );
}

export default CreateBlog;
