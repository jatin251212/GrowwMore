import { useEffect, useState } from "react";

const useDocTitle = title => {
  const [doctitle, setDocTitle] = useState(title);

  useEffect(() => {
    document.title = doctitle;
  }, [doctitle]);

  //[doctitle] in dependency array here,we change it to []

  return [doctitle, setDocTitle];
};

export {useDocTitle};