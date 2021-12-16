export enum EPermission {
  READ = 4, WRITE = 2, EXECUTE = 1
}

export enum EEntity {
  USER, GROUP, OTHERS, BUDDIES
}

export class Permission {

  /**
   * by default only the creator has all permissions
   * @type {number}
   */
  // TODO: When to enable buddies?
  public static ALL_READ_READ = 744;
  public static ALL_NONE_NONE = 700;
  public static ALL_READ_NONE = 740;
  public static DEFAULT_PERMISSION = Permission.ALL_READ_READ;

  /**
   * buddy variants: buddy, creator, group, others
   * buddies first for backward compatibility
   */
  public static ALL_ALL_READ_READ = 7744;
  public static ALL_ALL_NONE_NONE = 7700;
  public static ALL_ALL_READ_NONE = 7740;

  constructor(public readonly user: Set<EPermission>, public readonly group: Set<EPermission>, public readonly others: Set<EPermission>, public readonly buddies: Set<EPermission> = new Set()) {
  }

  encode() {
    return Permission.encode(this.user, this.group, this.others, this.buddies);
  }

  toString() {
    const userEncoded = Permission.toString(this.user);
    const groupEncoded = Permission.toString(this.group);
    const othersEncoded = Permission.toString(this.others);
    const buddiesEncoded = Permission.toString(this.buddies);
    return buddiesEncoded + userEncoded + groupEncoded + othersEncoded;
  }

  clone() {
    return new Permission(
      new Set(this.user),
      new Set(this.group),
      new Set(this.others),
      new Set(this.buddies),
    );
  }

  getPermissions(entity: EEntity) {
    switch(entity) {
      case EEntity.USER: return this.user;
      case EEntity.GROUP: return this.group;
      case EEntity.OTHERS: return this.others;
      case EEntity.BUDDIES: return this.buddies;
    }
  }

  hasPermission(entity: EEntity, permission: EPermission) {
    const permissions = this.getPermissions(entity);
    return permissions.has(permission);
  }

  static toNumber(p: Set<EPermission>) {
    return (p.has(EPermission.READ) ? 4 : 0) + (p.has(EPermission.WRITE) ? 2 : 0) + (p.has(EPermission.EXECUTE) ? 1 : 0);
  }

  static toString(p: Set<EPermission>) {
    return (p.has(EPermission.READ) ? 'r' : '-') + (p.has(EPermission.WRITE) ? 'w' : '-') + (p.has(EPermission.EXECUTE) ? 'x' : '-');
  }

  static fromNumber(p: number) {
    const r = new Set<EPermission>();
    if (p >= 4) {
      r.add(EPermission.READ);
      p -= 4;
    }
    if (p >= 2) {
      r.add(EPermission.WRITE);
      p -= 2;
    }
    if (p >= 1) {
      r.add(EPermission.EXECUTE);
    }
    return r;
  }

  static encode(user: Set<EPermission>, group: Set<EPermission>, others: Set<EPermission>, buddies: Set<EPermission> = new Set()) {
    const userEncoded = Permission.toNumber(user);
    const groupEncoded = Permission.toNumber(group);
    const othersEncoded = Permission.toNumber(others);
    const buddiesEncoded = Permission.toNumber(buddies);
    return buddiesEncoded * 1000 + userEncoded * 100 + groupEncoded * 10 + othersEncoded;
  }

  static decode(permission = Permission.DEFAULT_PERMISSION) {
    if (typeof permission !== 'number') {
      permission = Permission.DEFAULT_PERMISSION;
    }
    const others = Permission.fromNumber(permission % 10);
    const group = Permission.fromNumber(Math.floor(permission / 10) % 10);
    const user = Permission.fromNumber(Math.floor(permission / 100) % 10);
    const buddies = Permission.fromNumber(Math.floor(permission / 1000) % 10);
    return new Permission(user, group, others, buddies);
  }
}
