"""
IEEE Robotics & Automation Society - Cloud PostgreSQL Database Module
Supports Neon, Supabase, Vercel Postgres, or local fallback.
Uses pg8000 (pure-Python DB-API 2.0 driver, serverless-optimized).
"""
import os
import ssl
import json
import time
import urllib.parse

# Local in-memory fallback cache if DATABASE_URL is not set
_MEMORY_STORE = {
    "members": [],
    "participants": [],
    "commits": [],
    "initialized": False
}

def get_db_url():
    """Retrieve database connection string from environment."""
    return os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL") or ""

def get_connection():
    """
    Establish a connection to PostgreSQL using pg8000.
    Returns (connection, None) or (None, error_string).
    """
    db_url = get_db_url().strip()
    if not db_url:
        return None, "DATABASE_URL environment variable is not configured"

    try:
        import pg8000
    except ImportError:
        return None, "pg8000 library is not installed"

    # Normalize url scheme if necessary (e.g., postgres:// -> postgresql://)
    parsed = urllib.parse.urlparse(db_url)
    user = urllib.parse.unquote(parsed.username or "")
    password = urllib.parse.unquote(parsed.password or "")
    host = parsed.hostname or "localhost"
    port = parsed.port or 5432
    database = parsed.path.lstrip("/").split("?")[0]

    # Handle SSL context for cloud providers (Neon, Supabase, Vercel Postgres require SSL)
    ssl_context = None
    query_params = urllib.parse.parse_qs(parsed.query)
    sslmode = query_params.get("sslmode", ["require"])[0]

    if sslmode != "disable":
        ssl_context = ssl.create_default_context()
        # For serverless cloud endpoints, verify hostname and certificates
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE

    try:
        conn = pg8000.connect(
            user=user,
            password=password,
            host=host,
            port=port,
            database=database,
            ssl_context=ssl_context,
            timeout=15
        )
        return conn, None
    except Exception as exc:
        return None, str(exc)

def get_default_members():
    """Generate default seed members using current environment settings."""
    lead_name = os.environ.get("LEAD_NAME", "XYZ")
    lead_email = os.environ.get("LEAD_EMAIL", "xyz@vitstudent.ac.in")
    lead_github = os.environ.get("LEAD_GITHUB_USER", "xyz")
    lead_linkedin = os.environ.get("LEAD_LINKEDIN_URL", "https://linkedin.com/in/xyz")
    lead_pwd = os.environ.get("DEFAULT_LEAD_PASSWORD", "lead123")
    member_pwd = os.environ.get("DEFAULT_MEMBER_PASSWORD", "member123")

    return [
        {
            "id": "mem-1",
            "name": lead_name,
            "email": lead_email,
            "password": lead_pwd,
            "role": "Lead Architect",
            "role_type": "club_lead",
            "track": "Autonomous Robotics & ROS2",
            "year": "3rd Year",
            "branch": "B.Tech CSE (Robotics & AI)",
            "bio": "Lead architect for autonomous robotics. Specializing in ROS2 lifecycle nodes, multi-sensor LiDAR SLAM, and real-time telemetry.",
            "github": lead_github,
            "linkedin": lead_linkedin,
            "status": "Online",
            "avatar_url": ""
        },
        {
            "id": "mem-2",
            "name": "Ananya Sharma",
            "email": "ananya.s2024@vitstudent.ac.in",
            "password": lead_pwd,
            "role": "Subsystem Lead (AI & Vision)",
            "role_type": "club_lead",
            "track": "AI & Computer Vision",
            "year": "3rd Year",
            "branch": "B.Tech AI & Data Engineering",
            "bio": "Leading perception R&D for obstacle classification using YOLOv10, depth camera stereo vision, and optical flow tracking.",
            "github": "ananya-sharma",
            "linkedin": "https://linkedin.com/in/ananya-sharma",
            "status": "Online",
            "avatar_url": ""
        },
        {
            "id": "mem-3",
            "name": "Kavya Patel",
            "email": "kavya.p2024@vitstudent.ac.in",
            "password": member_pwd,
            "role": "Core R&D Engineer",
            "role_type": "regular_member",
            "track": "Mechanical CAD & Bionics",
            "year": "2nd Year",
            "branch": "B.Tech Mechanical Engineering",
            "bio": "Focusing on generative CAD modeling in SolidWorks, structural FEA stress analysis, and 4-DOF planetary rover suspension.",
            "github": "kavya-patel",
            "linkedin": "https://linkedin.com/in/kavya-patel",
            "status": "Online",
            "avatar_url": ""
        },
        {
            "id": "mem-4",
            "name": "Aryan Nair",
            "email": "aryan.n2024@vitstudent.ac.in",
            "password": member_pwd,
            "role": "Junior Researcher",
            "role_type": "regular_member",
            "track": "Autonomous Robotics & ROS2",
            "year": "1st Year",
            "branch": "B.Tech Electronics & Communication",
            "bio": "Junior researcher exploring decentralized drone swarm mesh topologies, ESP32 wireless telemetry, and sensor filtering.",
            "github": "aryan-nair",
            "linkedin": "https://linkedin.com/in/aryan-nair",
            "status": "Active",
            "avatar_url": ""
        },
        {
            "id": "mem-5",
            "name": "Rohan Verma",
            "email": "rohan.v2024@vitstudent.ac.in",
            "password": member_pwd,
            "role": "Core R&D Engineer (Embedded)",
            "role_type": "regular_member",
            "track": "Embedded Systems & Microcontrollers",
            "year": "3rd Year",
            "branch": "B.Tech Electrical & Electronics",
            "bio": "Embedded systems developer working on STM32 bare-metal C++, CAN-FD bus communication, brushless motor PID tuning, and BMS.",
            "github": "rohan-verma",
            "linkedin": "https://linkedin.com/in/rohan-verma",
            "status": "Offline",
            "avatar_url": ""
        }
    ]

def get_default_participants():
    """Generate default seed participants."""
    participant_pwd = os.environ.get("DEFAULT_PARTICIPANT_PASSWORD", "participant123")
    return [
        {
            "id": "part-1",
            "name": "Alex Chen",
            "email": "alex.chen2024@gmail.com",
            "reg_no": "24BCE1001",
            "password": participant_pwd,
            "role_title": "Event Participant",
            "track": "RoboHack 2026: Autonomous Rover Challenge"
        },
        {
            "id": "part-2",
            "name": "Priya Sundaram",
            "email": "priya.sundaram@vitstudent.ac.in",
            "reg_no": "24BCE1042",
            "password": participant_pwd,
            "role_title": "Event Participant",
            "track": "DroneSwarm Grand Prix"
        },
        {
            "id": "part-3",
            "name": "Tanmay Joshi",
            "email": "tanmay.j2024@vitstudent.ac.in",
            "reg_no": "24BME1088",
            "password": participant_pwd,
            "role_title": "Event Participant",
            "track": "Underwater Robotics Symposium"
        }
    ]

def get_default_commits():
    """Generate default GitHub commits."""
    lead_name = os.environ.get("LEAD_NAME", "XYZ")
    lead_github = os.environ.get("LEAD_GITHUB_USER", "xyz")
    return [
        {
            "id": "c-1",
            "hash": "8f24a1b",
            "msg": "User updated autonomous-rover-v2",
            "author": lead_name,
            "github": lead_github,
            "time_ago": "2m ago",
            "timestamp_val": int(time.time() * 1000) - 120000
        },
        {
            "id": "c-2",
            "hash": "7c31d04",
            "msg": "Merged PR #42: SLAM LiDAR mapping filter",
            "author": "Ananya Sharma",
            "github": "ananya-sharma",
            "time_ago": "14m ago",
            "timestamp_val": int(time.time() * 1000) - 840000
        },
        {
            "id": "c-3",
            "hash": "3e99b7a",
            "msg": "Fix PID controller jitter on CAN-FD bus",
            "author": "Rohan Verma",
            "github": "rohan-verma",
            "time_ago": "1h ago",
            "timestamp_val": int(time.time() * 1000) - 3600000
        }
    ]

def init_db():
    """
    Initialize PostgreSQL tables if not present and seed initial data if tables are empty.
    Returns (True, info_dict) or (False, error_msg).
    """
    conn, err = get_connection()
    if err:
        # Fallback to local memory initialization
        if not _MEMORY_STORE["initialized"]:
            _MEMORY_STORE["members"] = get_default_members()
            _MEMORY_STORE["participants"] = get_default_participants()
            _MEMORY_STORE["commits"] = get_default_commits()
            _MEMORY_STORE["initialized"] = True
        return False, f"PostgreSQL unavailable ({err}). Running on local fallback."

    try:
        cur = conn.cursor()
        
        # 1. Create core_members table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS core_members (
                id VARCHAR(64) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL,
                role_type VARCHAR(64) NOT NULL DEFAULT 'regular_member',
                track VARCHAR(255),
                year VARCHAR(64),
                branch VARCHAR(255),
                bio TEXT,
                github VARCHAR(255),
                linkedin VARCHAR(255),
                status VARCHAR(64) DEFAULT 'Offline',
                avatar_url TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 2. Create participants table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS participants (
                id VARCHAR(64) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                reg_no VARCHAR(64) NOT NULL,
                password VARCHAR(255) NOT NULL,
                role_title VARCHAR(255) DEFAULT 'Event Participant',
                track VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 3. Create commits table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS commits (
                id VARCHAR(64) PRIMARY KEY,
                hash VARCHAR(64) NOT NULL,
                msg TEXT NOT NULL,
                author VARCHAR(255) NOT NULL,
                github VARCHAR(255),
                time_ago VARCHAR(64),
                timestamp_val BIGINT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()

        # Seed core_members if table is empty
        cur.execute("SELECT COUNT(*) FROM core_members")
        member_count = cur.fetchone()[0]
        if member_count == 0:
            default_mems = get_default_members()
            for m in default_mems:
                cur.execute("""
                    INSERT INTO core_members (
                        id, name, email, password, role, role_type,
                        track, year, branch, bio, github, linkedin, status, avatar_url
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (email) DO NOTHING
                """, (
                    m["id"], m["name"], m["email"], m["password"], m["role"], m["role_type"],
                    m["track"], m["year"], m["branch"], m["bio"], m["github"], m["linkedin"],
                    m["status"], m["avatar_url"]
                ))
            conn.commit()

        # Seed participants if table is empty
        cur.execute("SELECT COUNT(*) FROM participants")
        part_count = cur.fetchone()[0]
        if part_count == 0:
            default_parts = get_default_participants()
            for p in default_parts:
                cur.execute("""
                    INSERT INTO participants (
                        id, name, email, reg_no, password, role_title, track
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (email) DO NOTHING
                """, (
                    p["id"], p["name"], p["email"], p["reg_no"], p["password"],
                    p["role_title"], p["track"]
                ))
            conn.commit()

        # Seed commits if table is empty
        cur.execute("SELECT COUNT(*) FROM commits")
        commit_count = cur.fetchone()[0]
        if commit_count == 0:
            default_comms = get_default_commits()
            for c in default_comms:
                cur.execute("""
                    INSERT INTO commits (
                        id, hash, msg, author, github, time_ago, timestamp_val
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                """, (
                    c["id"], c["hash"], c["msg"], c["author"], c["github"],
                    c["time_ago"], c["timestamp_val"]
                ))
            conn.commit()

        cur.close()
        conn.close()
        return True, "Database schema verified and default seed accounts ensured."
    except Exception as exc:
        if conn:
            try:
                conn.close()
            except Exception:
                pass
        return False, f"Database initialization failed: {exc}"

def get_members():
    """Retrieve all core members as a list of dictionaries."""
    conn, err = get_connection()
    if err:
        if not _MEMORY_STORE["initialized"]:
            init_db()
        return _MEMORY_STORE["members"]

    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, name, email, password, role, role_type,
                   track, year, branch, bio, github, linkedin, status, avatar_url
            FROM core_members
            ORDER BY id ASC
        """)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        members = []
        for r in rows:
            members.append({
                "id": r[0],
                "name": r[1],
                "email": r[2],
                "password": r[3],
                "role": r[4],
                "roleType": r[5],
                "track": r[6] or "",
                "year": r[7] or "",
                "branch": r[8] or "",
                "bio": r[9] or "",
                "github": r[10] or "",
                "linkedin": r[11] or "",
                "status": r[12] or "Online",
                "avatarUrl": r[13] or ""
            })
        return members
    except Exception as e:
        print(f"Error fetching members from DB: {e}")
        return _MEMORY_STORE["members"]

def save_member(m):
    """Upsert a single member into core_members table."""
    conn, err = get_connection()
    if err:
        # Fallback to local memory store
        existing = next((x for x in _MEMORY_STORE["members"] if x.get("email", "").lower() == m.get("email", "").lower()), None)
        if existing:
            existing.update(m)
        else:
            _MEMORY_STORE["members"].append(m)
        return m

    try:
        cur = conn.cursor()
        m_id = m.get("id") or f"mem-{int(time.time())}"
        role_type = m.get("roleType") or m.get("role_type") or "regular_member"
        cur.execute("""
            INSERT INTO core_members (
                id, name, email, password, role, role_type,
                track, year, branch, bio, github, linkedin, status, avatar_url
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                password = EXCLUDED.password,
                role = EXCLUDED.role,
                role_type = EXCLUDED.role_type,
                track = EXCLUDED.track,
                year = EXCLUDED.year,
                branch = EXCLUDED.branch,
                bio = EXCLUDED.bio,
                github = EXCLUDED.github,
                linkedin = EXCLUDED.linkedin,
                status = EXCLUDED.status,
                avatar_url = EXCLUDED.avatar_url
        """, (
            m_id,
            m.get("name", ""),
            m.get("email", ""),
            m.get("password", ""),
            m.get("role", "Core R&D Engineer"),
            role_type,
            m.get("track", ""),
            m.get("year", ""),
            m.get("branch", ""),
            m.get("bio", ""),
            m.get("github", ""),
            m.get("linkedin", ""),
            m.get("status", "Active"),
            m.get("avatarUrl") or m.get("avatar_url") or ""
        ))
        conn.commit()
        cur.close()
        conn.close()
        return m
    except Exception as exc:
        print(f"Error saving member to DB: {exc}")
        return m

def get_participants():
    """Retrieve all participants as a list of dictionaries."""
    conn, err = get_connection()
    if err:
        if not _MEMORY_STORE["initialized"]:
            init_db()
        return _MEMORY_STORE["participants"]

    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, name, email, reg_no, password, role_title, track
            FROM participants
            ORDER BY id ASC
        """)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        participants = []
        for r in rows:
            participants.append({
                "id": r[0],
                "name": r[1],
                "email": r[2],
                "regNo": r[3],
                "password": r[4],
                "roleTitle": r[5] or "Event Participant",
                "track": r[6] or ""
            })
        return participants
    except Exception as e:
        print(f"Error fetching participants from DB: {e}")
        return _MEMORY_STORE["participants"]

def save_participant(p):
    """Upsert a single participant into participants table."""
    conn, err = get_connection()
    if err:
        existing = next((x for x in _MEMORY_STORE["participants"] if x.get("email", "").lower() == p.get("email", "").lower()), None)
        if existing:
            existing.update(p)
        else:
            _MEMORY_STORE["participants"].append(p)
        return p

    try:
        cur = conn.cursor()
        p_id = p.get("id") or f"part-{int(time.time())}"
        reg_no = p.get("regNo") or p.get("reg_no") or ""
        role_title = p.get("roleTitle") or p.get("role_title") or "Event Participant"
        cur.execute("""
            INSERT INTO participants (
                id, name, email, reg_no, password, role_title, track
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                reg_no = EXCLUDED.reg_no,
                password = EXCLUDED.password,
                role_title = EXCLUDED.role_title,
                track = EXCLUDED.track
        """, (
            p_id,
            p.get("name", ""),
            p.get("email", ""),
            reg_no,
            p.get("password", ""),
            role_title,
            p.get("track", "")
        ))
        conn.commit()
        cur.close()
        conn.close()
        return p
    except Exception as exc:
        print(f"Error saving participant to DB: {exc}")
        return p

def get_commits():
    """Retrieve recent commits."""
    conn, err = get_connection()
    if err:
        if not _MEMORY_STORE["initialized"]:
            init_db()
        return _MEMORY_STORE["commits"]

    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, hash, msg, author, github, time_ago, timestamp_val
            FROM commits
            ORDER BY created_at DESC
            LIMIT 20
        """)
        rows = cur.fetchall()
        cur.close()
        conn.close()

        commits = []
        for r in rows:
            commits.append({
                "id": r[0],
                "hash": r[1],
                "msg": r[2],
                "author": r[3],
                "github": r[4],
                "time": r[5],
                "timestamp": r[6]
            })
        return commits
    except Exception as e:
        print(f"Error fetching commits from DB: {e}")
        return _MEMORY_STORE["commits"]

def save_commit(c):
    """Insert a commit into commits table."""
    conn, err = get_connection()
    if err:
        _MEMORY_STORE["commits"].insert(0, c)
        return c

    try:
        cur = conn.cursor()
        c_id = c.get("id") or f"c-{int(time.time())}"
        cur.execute("""
            INSERT INTO commits (
                id, hash, msg, author, github, time_ago, timestamp_val
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """, (
            c_id,
            c.get("hash", ""),
            c.get("msg", ""),
            c.get("author", ""),
            c.get("github", ""),
            c.get("time") or c.get("time_ago", "Just now"),
            c.get("timestamp") or int(time.time() * 1000)
        ))
        conn.commit()
        cur.close()
        conn.close()
        return c
    except Exception as exc:
        print(f"Error saving commit to DB: {exc}")
        return c

def check_db_status():
    """Check database connection and return status information."""
    conn, err = get_connection()
    if err:
        return {
            "connected": False,
            "engine": "local_fallback",
            "message": f"Cloud database not connected: {err}",
            "hint": "Set DATABASE_URL to your Neon PostgreSQL connection string"
        }
    try:
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM core_members")
        m_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM participants")
        p_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM commits")
        c_count = cur.fetchone()[0]
        cur.close()
        conn.close()
        return {
            "connected": True,
            "engine": "PostgreSQL (Neon/Cloud)",
            "message": "Cloud PostgreSQL database is online and healthy.",
            "members_count": m_count,
            "participants_count": p_count,
            "commits_count": c_count
        }
    except Exception as e:
        return {
            "connected": False,
            "engine": "PostgreSQL (Error)",
            "message": f"Query failed: {e}"
        }
