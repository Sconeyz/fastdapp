import React, { useRef, Suspense, Fragment, useEffect } from 'react';
import { useRouter } from 'next/router'
import axios from 'axios';

import { watchAccount, getAccount, fetchToken, fetchBalance } from '@wagmi/core'

import Editor from '@monaco-editor/react';

import examples from 'examples/list';

import Render from 'components/render';
import Publish from 'components/publish';


let editorRef;



export default function TestPage({ source }) {

    const router = useRouter()

    editorRef = useRef(null);
    const [content, setContent] = React.useState(``);
    const [isLoaded, setIsLoaded] = React.useState(``);


    function getExampleURL(smapleName = null) {
        return ("https://raw.githubusercontent.com/verynifty/etherpage/main/examples/" + (smapleName == null ? 'simple' : smapleName) + ".md")
    }

   


    useEffect(() => {
        async function load() {
            try {
                let f = await axios.get(getExampleURL(router.query.template))
                setContent(f.data)
                setRendered(content)
            } catch (error) {
                console.log(error)
            }
        }
    
        load();
    }, []);


    const [rendered, setRendered] = React.useState(content);
    const [isPublishing, setIsPublishing] = React.useState(false);

    let account = getAccount();

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    async function handleEditorChange(value, event) {
        setContent(value)
    }

    function handleRender() {
        setRendered(content)
    }

    function handlePublish() {
        setIsPublishing(!isPublishing)
    }

    function RightPanel() {
        if (isPublishing) {
            return (<Publish content={rendered} />);
        } else {
            return (
                <Editor height="90vh" defaultLanguage="mdx" onChange={handleEditorChange}
                    onMount={handleEditorDidMount} defaultValue={content} />
            );
        }
    }



    <Editor height="90vh" defaultLanguage="javascript" onChange={handleEditorChange}
        onMount={handleEditorDidMount} defaultValue="// some comment" />;


    return (
        <div>
            <div className="bg-slate-500 p-2	md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Playground
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    {!isPublishing ?
                        <button
                            onClick={handleRender}
                            type="button"
                            className="inline-flex items-center rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
                        >
                            Render
                        </button>
                        : null}
                    <button
                        onClick={handlePublish}
                        type="button"
                        className="ml-3 inline-flex items-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    >
                        {!isPublishing ? 'Publish' : 'Edit'}
                    </button>
                </div>
            </div>
            <div className=" flex">
                <div className="flex-1">
                    <Render content={rendered} />

                </div>
                <div className="flex-1">
                    {RightPanel()}
                </div>

            </div>
        </div>
    )
}
