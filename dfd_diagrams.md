# DormEase Management System - Data Flow Diagrams

This document contains the Data Flow Diagrams (DFD) for the DormEase dormitory management system.

## DFD Level 0 (Context Diagram)

The Context Diagram shows the system as a single process interacting with external entities (Student and Admin).

```mermaid
graph LR
    subgraph External_Entities
        Student[Student]
        Admin[Admin / Staff]
    end

    System((DormEase Management System))

    %% Student Data Flows
    Student -- "Login Credentials" --> System
    Student -- "Booking Request" --> System
    Student -- "Payment Data" --> System
    Student -- "Complaint Entry" --> System
    System -- "Booking Confirmation" --> Student
    System -- "Payment Receipt" --> Student
    System -- "Mess Menu & Status" --> Student

    %% Admin Data Flows
    Admin -- "Login Credentials" --> System
    Admin -- "Room & Staff Updates" --> System
    Admin -- "Mess Menu Updates" --> System
    Admin -- "Complaint Resolution" --> System
    System -- "Analytics & Revenue Reports" --> Admin
    System -- "Student & Booking Records" --> Admin
```

---

## DFD Level 1 (Process Breakdown)

DFD Level 1 breaks down the main system into detailed sub-processes and data stores.

```mermaid
graph TD
    subgraph Entities
        Student[Student]
        Admin[Admin / Staff]
    end

    subgraph Processes
        P1((1.0 Authentication))
        P2((2.0 Student & Room Mgmt))
        P3((3.0 Booking & Allocation))
        P4((4.0 Payment Processing))
        P5((5.0 Service & Complaints))
        P6((6.0 Analytics))
    end

    subgraph Data_Stores
        D1[(D1: Users DB)]
        D2[(D2: Rooms DB)]
        D3[(D3: Bookings DB)]
        D4[(D4: Payments DB)]
        D5[(D5: Complaints DB)]
    end

    %% Process 1.0: Authentication
    Student -- "Login Req" --> P1
    Admin -- "Login Req" --> P1
    P1 -- "Verify" --> D1
    D1 -- "User Role" --> P1
    P1 -- "Auth Token" --> Student
    P1 -- "Auth Token" --> Admin

    %% Process 2.0: Student & Room Mgmt
    Admin -- "Manage Rooms" --> P2
    Admin -- "Manage Students" --> P2
    P2 -- "Store/Update" --> D1
    P2 -- "Store/Update" --> D2
    P2 -- "Student Data" --> Admin

    %% Process 3.0: Booking
    Student -- "Room Request" --> P3
    P3 -- "Check Avail" --> D2
    P3 -- "Create Booking" --> D3
    P3 -- "Confirmation" --> Student

    %% Process 4.0: Payments
    Student -- "Payment Info" --> P4
    P4 -- "Validate & Save" --> D4
    P4 -- "Update Booking" --> D3
    P4 -- "Receipt" --> Student

    %% Process 5.0: Complaints
    Student -- "Raise Complaint" --> P5
    Admin -- "Resolve Complaint" --> P5
    P5 -- "Store/Update" --> D5
    P5 -- "Status Update" --> Student

    %% Process 6.0: Analytics
    D1 -- "Stats" --> P6
    D2 -- "Stats" --> P6
    D4 -- "Stats" --> P6
    P6 -- "Reports" --> Admin
```

> [!NOTE]
> These diagrams represent the core data flow of the DormEase system based on the current implementation of routes and models in the backend.
