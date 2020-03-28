import React, { useState, useEffect } from 'react'
import axios from 'axios';
import Pusher from 'pusher-js';

const PEOPLE = ['Antwan', 'John', 'Steve', 'Anna', 'Margaret', 'Felix', 'Chris', 'Jamie', 'Rose', 'Bob', 'Vanessa', 'Bridget', 'Sebastian', 'Richard'];

export default function Comments() {
    const [comments, setComments] = useState([]);
    const [person, setPerson] = useState(null);

    useEffect(() => {
        const pusher = new Pusher(process.env.PUSHER_APP_KEY, {
            cluster: process.env.PUSHER_APP_CLUSTER,
            useTLS: true
        });

        const channel = pusher.subscribe('post-comments');

        channel.bind('new-comment', ({ comment = null }) => {
            comment && setComments(prevComments => prevComments.push(comment));
        });

        pusher.connection.bind('connected', () => {
            axios.post('/comments')
                .then(response => setComments(response.data.comments));
        });

        return () => {
            pusher.disconnect();
        }
    }, []);



    const nameBadgeStyles = {
        fontSize: '0.8rem',
        height: 40,
        borderRadius: 20,
        cursor: 'pointer'
    };

    const choosePersona = person => e => setPerson(person);

    const randomPeople = count => {
        const selected = [];
        let i = 0;

        count = Math.max(0, Math.min(count, PEOPLE.length));

        while (i < count) {
            const index = Math.floor(Math.random() * PEOPLE.length);
            if (selected.includes(index)) continue;
            ++i && selected.push(index);
        }

        return selected.map(index => {
            const person = PEOPLE[index];
            const className = 'd-block d-flex align-items-center text-center text-white bg-secondary font-weight-bold py-2 px-4 mr-3';

            return <span key={index} className={className} style={nameBadgeStyles} title={person} onClick={choosePersona(person)}>{person}</span>
        });
    };

    const handleKeyUp = e => {
        const value = e.target.value;

        if (e.keyCode === 13 && !e.shiftKey) {
            const comment = { person, comment: value, timestamp: +new Date };
            axios.post('/comment', comment);

            e.target.value = '';
            setPerson(null);
        }
    }


    return (
        <>
            <div className="border-bottom border-gray w-100 px-2 d-flex align-items-center bg-white justify-content-between" style={{ height: 90 }}>
                <h2 className="text-dark mb-0 mx-4">Comments</h2>
                <span className="badge badge-pill badge-primary mx-4" style={{ fontSize: '1.2rem' }}>{comments.length}</span>
            </div>

            <div className="border-top border-gray w-100 px-4 d-flex flex-wrap align-items-center align-content-center bg-light" style={{ height: 160 }}>

                {
                    !person &&
                    <span className="text-dark py-2" style={{ fontSize: '1.5rem', fontWeight: 500 }}>Choose your Persona</span>
                }

                <div className="w-100 py-2 pb-3 d-flex justify-content-start">
                    {
                        person
                            ? <span className="d-block d-flex align-items-center text-center text-white bg-primary font-weight-bold py-2 px-4 mr-3" style={nameBadgeStyles} title={person}>{person}</span>
                            : randomPeople(4)
                    }
                </div>

                {person && <textarea className="form-control px-3 py-2" onKeyUp={handleKeyUp} placeholder="Make a comment" style={{ resize: 'none' }}></textarea>}

            </div>
        </>
    )
}
