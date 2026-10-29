import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDb from "./config/db.js";
import User from "./models/user.model.js";
import Post from "./models/post.model.js";
import Message from "./models/message.model.js";

const demoStudents = [
    {
        name: "Sanket Gokhale",
        userName: "sanket",
        email: "sanket@stanford.edu",
        password: "password123",
        college: "Stanford University",
        degree: "B.S. Computer Science",
        year: "Class of 2026",
        skills: ["React", "Node.js", "Python", "Fullstack", "GraphQL"],
        bio: "Building collaborative student tech. Passionate about AI agents and web engineering 🚀",
        profession: "Software Engineering Student",
        gender: "male",
        verificationStatus: "Verified",
        verificationMethod: "email",
        collegeEmail: "sanket@stanford.edu",
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
    },
    {
        name: "Alex Rivera",
        userName: "alex_mit",
        email: "alex@mit.edu",
        password: "password123",
        college: "Massachusetts Institute of Technology (MIT)",
        degree: "B.S. Artificial Intelligence & Robotics",
        year: "Class of 2025",
        skills: ["Python", "PyTorch", "ROS", "C++", "Computer Vision"],
        bio: "Robotics lab researcher. Looking for hackathon teammates to build autonomous quadcopters 🤖",
        profession: "AI & Robotics Researcher",
        gender: "male",
        verificationStatus: "Verified",
        verificationMethod: "email",
        collegeEmail: "alex@mit.edu",
        profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80"
    },
    {
        name: "Priya Sharma",
        userName: "priya_iit",
        email: "priya@iitb.ac.in",
        password: "password123",
        college: "IIT Bombay",
        degree: "B.Tech Electrical & CS",
        year: "Class of 2026",
        skills: ["UI/UX Design", "Figma", "React", "TailwindCSS", "Next.js"],
        bio: "Designing interfaces that students love. Winner of National Designathon '24 🎨✨",
        profession: "Product Designer & Frontend Dev",
        gender: "female",
        verificationStatus: "Verified",
        verificationMethod: "email",
        collegeEmail: "priya@iitb.ac.in",
        profileImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80"
    },
    {
        name: "Marcus Chen",
        userName: "marcus_c",
        email: "mchen@berkeley.edu",
        password: "password123",
        college: "UC Berkeley",
        degree: "B.A. Data Science & Economics",
        year: "Class of 2027",
        skills: ["SQL", "Tableau", "Python", "Financial Modeling", "R"],
        bio: "Data storyteller. Exploring fintech algorithms and algorithmic trading models 📊",
        profession: "Data Science Student",
        gender: "male",
        verificationStatus: "Pending",
        verificationMethod: "id_card",
        collegeEmail: "mchen@berkeley.edu",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
    },
    {
        name: "Elena Rostova",
        userName: "elena_r",
        email: "elena@harvard.edu",
        password: "password123",
        college: "Harvard University",
        degree: "B.S. Bioengineering",
        year: "Class of 2026",
        skills: ["CRISPR", "Bioinformatics", "Python", "Data Analysis"],
        bio: "Bioinformatics nerd looking for machine learning coders to analyze genomic datasets 🧬",
        profession: "Bioinformatics Researcher",
        gender: "female",
        verificationStatus: "Unverified",
        verificationMethod: "none",
        profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80"
    }
];

async function seed() {
    try {
        await connectDb();
        console.log("Connected to DB for seeding...");

        // Clear existing demo data or update
        const createdUsers = [];
        for (const student of demoStudents) {
            let existing = await User.findOne({ userName: student.userName });
            const hashedPassword = await bcrypt.hash(student.password, 10);

            if (existing) {
                existing.name = student.name;
                existing.college = student.college;
                existing.degree = student.degree;
                existing.year = student.year;
                existing.skills = student.skills;
                existing.bio = student.bio;
                existing.profession = student.profession;
                existing.verificationStatus = student.verificationStatus;
                existing.verificationMethod = student.verificationMethod;
                existing.collegeEmail = student.collegeEmail || "";
                existing.profileImage = student.profileImage;
                existing.password = hashedPassword;
                await existing.save();
                createdUsers.push(existing);
                console.log(`Updated user: ${student.userName}`);
            } else {
                const user = await User.create({
                    ...student,
                    password: hashedPassword
                });
                createdUsers.push(user);
                console.log(`Created user: ${student.userName}`);
            }
        }

        const [sanket, alex, priya, marcus, elena] = createdUsers;

        // Set up connection: Sanket <-> Alex (Mutual connection)
        if (!sanket.connections.includes(alex._id)) sanket.connections.push(alex._id);
        if (!alex.connections.includes(sanket._id)) alex.connections.push(sanket._id);

        // Set up pending request: Priya sent request to Sanket
        sanket.connectionRequests = [
            {
                from: priya._id,
                status: "pending",
                createdAt: new Date(Date.now() - 3600000)
            }
        ];
        priya.sentRequests = [
            {
                to: sanket._id,
                status: "pending",
                createdAt: new Date(Date.now() - 3600000)
            }
        ];

        // Set up sent request: Sanket sent request to Marcus
        sanket.sentRequests = [
            {
                to: marcus._id,
                status: "pending",
                createdAt: new Date(Date.now() - 7200000)
            }
        ];
        marcus.connectionRequests = [
            {
                from: sanket._id,
                status: "pending",
                createdAt: new Date(Date.now() - 7200000)
            }
        ];

        await Promise.all([
            sanket.save(),
            alex.save(),
            priya.save(),
            marcus.save(),
            elena.save()
        ]);

        console.log("Configured mutual connections and requests.");

        // Clear existing demo messages between Sanket & Alex and add realistic chat
        await Message.deleteMany({
            $or: [
                { sender: sanket._id, receiver: alex._id },
                { sender: alex._id, receiver: sanket._id }
            ]
        });

        await Message.create([
            {
                sender: alex._id,
                receiver: sanket._id,
                text: "Hey Sanket! Loved your post about the AI Pair Programming setup 🚀",
                createdAt: new Date(Date.now() - 1000 * 60 * 30)
            },
            {
                sender: sanket._id,
                receiver: alex._id,
                text: "Thanks Alex! Are you participating in the upcoming Stanford Hackathon?",
                createdAt: new Date(Date.now() - 1000 * 60 * 20)
            },
            {
                sender: alex._id,
                receiver: sanket._id,
                text: "Yes! Looking for a fullstack teammate for our autonomous drone vision system. Would you be down?",
                createdAt: new Date(Date.now() - 1000 * 60 * 10)
            }
        ]);
        console.log("Seeded demo private messages between Sanket & Alex.");

        // Create sample posts
        await Post.deleteMany({});

        const p1 = await Post.create({
            author: alex._id,
            caption: "🚀 Seeking 2 Teammates for CalHacks 2025! We are building an autonomous visual guidance system for campus delivery drones. Looking for someone with strong React & WebRTC experience. Drop a comment below or send a connection request!",
            media: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
            mediaType: "image",
            isProjectTeammateSearch: true,
            projectRole: "Frontend / WebRTC Developer",
            requiredSkills: ["React", "WebRTC", "TypeScript", "TailwindCSS"],
            likes: [sanket._id, priya._id],
            comments: [
                {
                    _id: new mongoose.Types.ObjectId(),
                    author: sanket._id,
                    message: "This sounds awesome Alex! Let's connect on private messages, I have prior experience with drone telemetry dashboards.",
                    parentId: null,
                    likes: [alex._id],
                    createdAt: new Date(Date.now() - 1000 * 60 * 50)
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    author: priya._id,
                    message: "I can help with the 3D telemetry UI and Figma prototypes if you need a product designer!",
                    parentId: null,
                    likes: [alex._id, sanket._id],
                    createdAt: new Date(Date.now() - 1000 * 60 * 40)
                }
            ]
        });

        // Add a nested Reddit-style reply to Sanket's comment
        const sanketCommentId = p1.comments[0]._id;
        p1.comments.push({
            _id: new mongoose.Types.ObjectId(),
            author: alex._id,
            message: "@sanket Awesome! Just replied to you in private messages. Let's sync up over Discord.",
            parentId: sanketCommentId,
            likes: [sanket._id],
            createdAt: new Date(Date.now() - 1000 * 60 * 30)
        });
        await p1.save();

        const p2 = await Post.create({
            author: priya._id,
            caption: "Just published the UI Design System for our college's open source student portal! Featuring high-contrast dark mode, verified college badges, and accessible typography. Feedback is warmly welcome 🎨✨",
            media: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80",
            mediaType: "image",
            isProjectTeammateSearch: false,
            likes: [sanket._id, marcus._id, alex._id],
            comments: [
                {
                    _id: new mongoose.Types.ObjectId(),
                    author: marcus._id,
                    message: "The color hierarchy looks super crisp. Did you use Tailwind or custom tokens?",
                    parentId: null,
                    likes: [priya._id],
                    createdAt: new Date(Date.now() - 1000 * 60 * 25)
                }
            ]
        });

        const p3 = await Post.create({
            author: sanket._id,
            caption: "Welcome to Dodoo Campus! Verified college networking platform combining genuine student profiles, teammate discovery, Reddit-style nested discussions, and secure connection-locked messaging. Excited to connect with fellow students across universities!",
            media: "",
            mediaType: "text",
            isProjectTeammateSearch: false,
            likes: [alex._id, priya._id, marcus._id, elena._id],
            comments: [
                {
                    _id: new mongoose.Types.ObjectId(),
                    author: elena._id,
                    message: "Love the focus on verified college badges and preventing spam messages. Great initiative!",
                    parentId: null,
                    likes: [sanket._id],
                    createdAt: new Date(Date.now() - 1000 * 60 * 15)
                }
            ]
        });

        // Link posts to users
        sanket.posts = [p3._id];
        alex.posts = [p1._id];
        priya.posts = [p2._id];

        await Promise.all([sanket.save(), alex.save(), priya.save()]);

        console.log("Seed finished successfully! All demo data loaded.");
        process.exit(0);
    } catch (err) {
        console.error("Seed error:", err);
        process.exit(1);
    }
}

seed();
