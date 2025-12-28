export interface SimpleGigJson {
  location: string,
  id: string
}

export default abstract class SimpleGig<T = object> {
  protected readonly id: string;

  protected constructor(
    protected readonly location: string,
    protected readonly startDateTime: string,
    protected readonly endDateTime: string
  ) {
    this.startDateTime = startDateTime.replace(/(:00)-0.*/, "$1")
    this.endDateTime = endDateTime.replace(/(:00)-0.*/, "$1")
    this.id = this.startDateTime.split("T")[0];
  }

  public getId() {
    return this.id;
  }

  public getLocation() {
    return this.location;
  }

  public getStartTime() {
    return this.startDateTime;
  }

  public getEndTime() {
    return this.endDateTime;
  }

  public abstract serialize(): T & SimpleGigJson
}
